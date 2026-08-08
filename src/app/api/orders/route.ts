import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/supabase/env";
import { MAX_ORDER_QUANTITY } from "@/lib/shop";
import {
  notifyHouseOfOrder,
  sendOrderEmail,
  type OrderForEmail,
} from "@/lib/email/order-emails";
import {
  cleanText,
  getClientIp,
  hashIp,
  isSameOrigin,
  rateLimit,
} from "@/lib/server/security";
import { validateEmail, validateName, validatePhone } from "@/lib/lead-validation";

/**
 * POST /api/orders
 * Places an order for one piece from the shop. Body:
 *   { productId, quantity?, name, email, phone?, address1?, address2?, city?,
 *     postalCode?, country?, note?, company? }   (company = honeypot)
 * Returns { ok, orderNumber }.
 *
 * The price is read from the products table on the server — never from the
 * browser — and the piece must be published and in stock. Orders land as
 * `pending` / `unpaid`; the concierge confirms and invoices from the dashboard.
 */

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  if (!hasServiceRole) {
    return NextResponse.json({ error: "The backend is not configured yet." }, { status: 503 });
  }
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Bad origin." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot — silently accept and drop.
  if (cleanText(body.company, 100)) {
    return NextResponse.json({ ok: true, orderNumber: null });
  }

  const productId = cleanText(body.productId, 40);
  const name = cleanText(body.name, 120);
  const email = cleanText(body.email, 160).toLowerCase();
  const phone = cleanText(body.phone, 40) || null;
  const address_line1 = cleanText(body.address1, 160) || null;
  const address_line2 = cleanText(body.address2, 160) || null;
  const city = cleanText(body.city, 80) || null;
  const postal_code = cleanText(body.postalCode, 24) || null;
  const country = cleanText(body.country, 80) || null;
  const note = cleanText(body.note, 2000) || null;

  const quantity = Math.min(
    MAX_ORDER_QUANTITY,
    Math.max(1, Math.floor(Number(body.quantity ?? 1) || 1)),
  );

  if (!UUID_RE.test(productId)) {
    return NextResponse.json({ error: "That piece could not be found." }, { status: 400 });
  }
  /* Same rules as the atelier prompt — a delivery that cannot be addressed to
     a real person, or confirmed to a real mailbox, is not an order we can
     fulfil. Phone is optional at checkout but validated when supplied. */
  const invalid =
    validateName(name) ?? validateEmail(email) ?? (phone ? validatePhone(phone) : undefined);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Per-IP guard: 6 orders / hour.
  const ipHash = hashIp(getClientIp(req));
  if (!(await rateLimit(supabase, `order:ip:${ipHash}`, 6, 3600))) {
    return NextResponse.json(
      { error: "Too many orders from this connection. Please try again shortly." },
      { status: 429 },
    );
  }

  // Authoritative product read — price, title and thumbnail all come from here.
  const { data: product } = await supabase
    .from("products")
    .select("id, slug, title, price, currency, status, in_stock, product_images(path, position)")
    .eq("id", productId)
    .eq("status", "active")
    .maybeSingle();

  if (!product) {
    return NextResponse.json(
      { error: "That piece is no longer available." },
      { status: 404 },
    );
  }
  if (!product.in_stock) {
    return NextResponse.json(
      { error: "That piece is currently reserved. Please write to the concierge." },
      { status: 409 },
    );
  }

  const unitPrice: number | null = product.price == null ? null : Number(product.price);
  const lineTotal = unitPrice == null ? null : unitPrice * quantity;
  const images = (product.product_images as { path: string; position: number }[] | null) ?? [];
  const thumbnail =
    [...images].sort((a, b) => a.position - b.position)[0]?.path ?? null;

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_name: name,
      email,
      phone,
      address_line1,
      address_line2,
      city,
      postal_code,
      country,
      note,
      currency: product.currency,
      subtotal: lineTotal ?? 0,
      total: lineTotal ?? 0,
      status: "pending",
      payment_status: "unpaid",
      ip_hash: ipHash,
      user_agent: req.headers.get("user-agent"),
    })
    .select(
      "id, order_number, customer_name, email, currency, total, address_line1, address_line2, city, postal_code, country, courier, tracking_number, tracking_url",
    )
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Could not place your order." }, { status: 500 });
  }

  const item = {
    order_id: order.id,
    product_id: product.id,
    title: product.title,
    slug: product.slug,
    unit_price: unitPrice,
    quantity,
    line_total: lineTotal,
    image_path: thumbnail,
  };

  const { error: itemError } = await supabase.from("order_items").insert(item);

  if (itemError) {
    // An order with no line has nothing to fulfil — roll it back rather than
    // leaving a ghost in the dashboard.
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json({ error: "Could not place your order." }, { status: 500 });
  }

  // Confirmation to the customer (+ an optional copy to the house). Best-effort:
  // a mail failure is logged in order_emails, never shown to the buyer, and
  // never fails an order that is already safely recorded.
  const forEmail = order as OrderForEmail;
  await Promise.allSettled([
    sendOrderEmail(forEmail, [item], "placed"),
    notifyHouseOfOrder(forEmail, [item]),
  ]);

  return NextResponse.json({ ok: true, orderNumber: order.order_number });
}
