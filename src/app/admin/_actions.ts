"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminUser, requireAdmin } from "@/lib/admin/auth";
import { hasServiceRole, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/env";
import {
  DEFAULT_CURRENCY,
  MAX_PRODUCT_IMAGES,
  ORDER_STATUS_IDS,
  PAYMENT_STATUS_IDS,
  PRODUCT_STATUS_IDS,
  slugify,
} from "@/lib/shop";
import {
  sendOrderEmail,
  type ItemForEmail,
  type OrderForEmail,
} from "@/lib/email/order-emails";
import { PRICE_FIELD_BY_KEY, PRICE_FIELDS } from "@/lib/pricing";
import { priceKey } from "@/lib/ring-options";
import type {
  LeadStage,
  NoteColor,
  OrderEmailKind,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
} from "@/lib/supabase/types";

/**
 * Server actions for the admin dashboard. Every mutation re-verifies the admin
 * and runs through the cookie-bound session client, so RLS is enforced as the
 * signed-in admin (belt-and-suspenders on top of requireAdmin()).
 */

const STAGES: LeadStage[] = ["new", "contacted", "qualified", "quoted", "won", "lost"];
const COLORS: NoteColor[] = ["sapphire", "amber", "emerald", "rose", "slate"];

// ---------------------------------------------------------------- CRM leads

export async function moveLead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const stage = String(formData.get("stage") ?? "") as LeadStage;
  const sortIndex = Number(formData.get("sortIndex") ?? 0);
  if (!id || !STAGES.includes(stage)) return;

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("leads")
    .update({ stage, sort_index: Number.isFinite(sortIndex) ? sortIndex : 0 })
    .eq("id", id);
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
}

export async function updateLeadNote(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").slice(0, 4000);
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("leads").update({ note }).eq("id", id);
  revalidatePath("/admin/crm");
}

export async function archiveLead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("leads").update({ archived: true }).eq("id", id);
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
}

// ------------------------------------------------------------- inquiries

export async function setInquiryStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["new", "read", "archived"].includes(status)) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("inquiries").update({ status }).eq("id", id);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

/** Promote an inquiry into a CRM lead (source='inquiry') and link both ways. */
export async function promoteInquiry(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createSupabaseServerClient();
  const { data: inq } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!inq) return;
  if (inq.promoted_lead_id) {
    // already promoted — no-op
    revalidatePath("/admin/inquiries");
    return;
  }

  const { data: lead } = await supabase
    .from("leads")
    .insert({
      name: inq.name,
      phone: inq.phone ?? "—",
      email: inq.email,
      source: "inquiry",
      stage: "new",
      note: inq.interest ? `${inq.interest}\n\n${inq.message}` : inq.message,
      inquiry_id: inq.id,
    })
    .select("id")
    .single();

  if (lead) {
    await supabase
      .from("inquiries")
      .update({ promoted_lead_id: lead.id, status: "read" })
      .eq("id", inq.id);
  }
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
}

// --------------------------------------------------------- craft requests

export async function setCraftStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["new", "read", "archived"].includes(status)) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("craft_requests").update({ status }).eq("id", id);
  revalidatePath("/admin/crafting");
  revalidatePath("/admin");
}

export async function updateCraftNote(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").slice(0, 4000);
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("craft_requests").update({ note }).eq("id", id);
  revalidatePath("/admin/crafting");
}

/**
 * Promote a bespoke commission into a CRM lead (source='craft') and link both
 * ways. The renders made while designing are re-pointed at the new lead as
 * well, so the CRM card opens with the visitor's own images.
 */
export async function promoteCraftRequest(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createSupabaseServerClient();
  const { data: request } = await supabase
    .from("craft_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!request) return;
  if (request.promoted_lead_id) {
    // already promoted — no-op
    revalidatePath("/admin/crafting");
    return;
  }

  const { data: lead } = await supabase
    .from("leads")
    .insert({
      name: request.name,
      phone: request.phone,
      email: request.email,
      source: "craft",
      stage: "new",
      config: request.config,
      estimated_price: request.estimated_price,
      note: request.note,
      craft_request_id: request.id,
    })
    .select("id")
    .single();

  if (lead) {
    await Promise.all([
      supabase
        .from("craft_requests")
        .update({ promoted_lead_id: lead.id, status: "read" })
        .eq("id", request.id),
      supabase
        .from("generations")
        .update({ lead_id: lead.id })
        .eq("craft_request_id", request.id),
    ]);
  }
  revalidatePath("/admin/crafting");
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
}

// ------------------------------------------------------------------ notes

/* --------------------------------------------------------- ai concierge */

export async function setAiConversationStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["new", "read", "archived"].includes(status)) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("ai_conversations").update({ status }).eq("id", id);
  revalidatePath("/admin/ai-inbox");
  revalidatePath("/admin");
}

export async function createNote(formData: FormData) {
  const admin = await requireAdmin();
  const body = String(formData.get("body") ?? "").slice(0, 4000);
  const color = String(formData.get("color") ?? "sapphire") as NoteColor;
  if (!body.trim()) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("notes").insert({
    body,
    color: COLORS.includes(color) ? color : "sapphire",
    author: admin.email,
  });
  revalidatePath("/admin/notes");
  revalidatePath("/admin");
}

export async function updateNote(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const body = String(formData.get("body") ?? "").slice(0, 4000);
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  const patch: { body?: string; pinned?: boolean; color?: NoteColor } = {};
  if (formData.has("body")) patch.body = body;
  if (formData.has("pinned")) patch.pinned = formData.get("pinned") === "true";
  const color = formData.get("color");
  if (typeof color === "string" && COLORS.includes(color as NoteColor)) {
    patch.color = color as NoteColor;
  }
  await supabase.from("notes").update(patch).eq("id", id);
  revalidatePath("/admin/notes");
  revalidatePath("/admin");
}

export async function deleteNote(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("notes").delete().eq("id", id);
  revalidatePath("/admin/notes");
  revalidatePath("/admin");
}

// --------------------------------------------------------------- products

/** Object paths are ours (we minted them at upload); still, never trust input. */
const IMAGE_PATH_RE = /^[A-Za-z0-9][A-Za-z0-9/_.-]{0,200}$/;

type ImageInput = { path: string; alt: string | null };

function parseImages(raw: FormDataEntryValue | null): ImageInput[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const seen = new Set<string>();
  const out: ImageInput[] = [];
  for (const entry of parsed) {
    const path = typeof entry === "object" && entry !== null ? String((entry as { path?: unknown }).path ?? "") : "";
    if (!IMAGE_PATH_RE.test(path) || path.includes("..") || seen.has(path)) continue;
    seen.add(path);
    const altRaw = typeof entry === "object" && entry !== null ? (entry as { alt?: unknown }).alt : null;
    out.push({ path, alt: typeof altRaw === "string" && altRaw.trim() ? altRaw.trim().slice(0, 200) : null });
    if (out.length >= MAX_PRODUCT_IMAGES) break;
  }
  return out;
}

/** Remove orphaned objects from the public bucket. Best-effort. */
async function removeProductObjects(paths: string[]) {
  if (!paths.length || !hasServiceRole) return;
  try {
    await createSupabaseAdminClient().storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  } catch (err) {
    console.error("[products] storage cleanup", err);
  }
}

/** First free slug in the `base`, `base-2`, `base-3`… series. */
async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  base: string,
  excludeId: string | null,
): Promise<string> {
  for (let i = 1; i < 60; i++) {
    const candidate = i === 1 ? base : `${base}-${i}`;
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data || data.id === excludeId) return candidate;
  }
  return `${base}-${Math.floor(Math.random() * 1e6)}`;
}

export type ProductFormState = { error?: string; ok?: boolean };

/**
 * Create or update a product, then reconcile its gallery. Images were uploaded
 * to Storage straight from the dashboard's browser session (which is why the
 * form only posts paths, never bytes — Server Actions cap request bodies at 1MB).
 */
export async function saveProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim().slice(0, 160);
  const description = String(formData.get("description") ?? "").trim().slice(0, 8000);
  const priceRaw = String(formData.get("price") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "draft") as ProductStatus;
  const status = PRODUCT_STATUS_IDS.includes(statusRaw) ? statusRaw : "draft";
  const featured = formData.get("featured") === "on";
  const inStock = formData.get("inStock") === "on";
  const slugInput = String(formData.get("slug") ?? "").trim();
  const images = parseImages(formData.get("images"));

  if (!title) return { error: "A title is required." };

  const price = priceRaw === "" ? null : Number(priceRaw);
  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    return { error: "Enter a price as a plain number, or leave it empty for “price upon request”." };
  }
  if (status === "active" && images.length === 0) {
    return { error: "Add at least one photograph before publishing a piece." };
  }

  const supabase = await createSupabaseServerClient();
  const slug = await uniqueSlug(supabase, slugify(slugInput || title), id || null);

  const fields = {
    title,
    slug,
    description,
    price,
    currency: DEFAULT_CURRENCY,
    category_id: categoryId || null,
    status,
    featured,
    in_stock: inStock,
  };

  let productId = id;
  let previousSlug: string | null = null;

  if (id) {
    const { data: existing } = await supabase
      .from("products")
      .select("slug")
      .eq("id", id)
      .maybeSingle();
    previousSlug = existing?.slug ?? null;
    const { error } = await supabase.from("products").update(fields).eq("id", id);
    if (error) return { error: "Could not save this piece. Please try again." };
  } else {
    const { data, error } = await supabase.from("products").insert(fields).select("id").single();
    if (error || !data) return { error: "Could not create this piece. Please try again." };
    productId = data.id;
  }

  // Reconcile the gallery: rewrite the rows, then bin the photographs that are
  // no longer referenced anywhere.
  const { data: oldRows } = await supabase
    .from("product_images")
    .select("path")
    .eq("product_id", productId);
  const oldPaths = ((oldRows as { path: string }[]) ?? []).map((r) => r.path);

  await supabase.from("product_images").delete().eq("product_id", productId);

  if (images.length) {
    const { error: imgError } = await supabase.from("product_images").insert(
      images.map((img, index) => ({
        product_id: productId,
        path: img.path,
        position: index,
        alt: img.alt,
      })),
    );
    if (imgError) return { error: "The piece was saved, but its images could not be attached." };
  }

  const keep = new Set(images.map((i) => i.path));
  await removeProductObjects(oldPaths.filter((p) => !keep.has(p)));

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  revalidatePath(`/shop/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/shop/${previousSlug}`);

  if (!id) redirect(`/admin/products/${productId}`);
  return { ok: true };
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createSupabaseServerClient();
  const { data: product } = await supabase
    .from("products")
    .select("slug, images:product_images(path)")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return;

  await removeProductObjects(
    ((product?.images as { path: string }[] | null) ?? []).map((i) => i.path),
  );

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  if (product?.slug) revalidatePath(`/shop/${product.slug}`);
  redirect("/admin/products");
}

// ----------------------------------------------------------------- orders

/** The columns an order email needs, plus the status we are moving away from. */
const ORDER_EMAIL_COLUMNS =
  "id, order_number, customer_name, email, currency, total, payment_method, address_line1, address_line2, city, postal_code, country, courier, tracking_number, tracking_url, status";

/** Which email a fulfilment state sends. 'pending' is the state an order starts
 *  in — moving back to it says nothing worth an email. */
const STATUS_EMAIL: Partial<Record<OrderStatus, OrderEmailKind>> = {
  confirmed: "confirmed",
  shipped: "shipped",
  out_for_delivery: "out_for_delivery",
  completed: "completed",
  cancelled: "cancelled",
};

const trimmed = (value: FormDataEntryValue | null, max: number): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/** A tracking link the admin typed. Coerce to https, drop anything unparseable
 *  — it ends up as an href in a customer's inbox. */
function normalizeTrackingUrl(raw: string): string | null {
  if (!raw) return null;
  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Move an order along the fulfilment ladder — and tell the customer.
 *
 * The dashboard posts `notify` (the "email the customer" switch) and, for the
 * shipped / out-for-delivery steps, the courier and tracking number collected in
 * the dialog. The email goes out when something the customer would care about
 * actually changed: the status, or the tracking on a status that carries it.
 */
export async function setOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!id || !ORDER_STATUS_IDS.includes(status)) return;

  const notify = formData.get("notify") !== "0";
  const carriesTracking = formData.has("trackingNumber") || formData.has("courier");

  const supabase = await createSupabaseServerClient();
  const { data: before } = await supabase
    .from("orders")
    .select(ORDER_EMAIL_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (!before) return;

  const patch: {
    status: OrderStatus;
    courier?: string | null;
    tracking_number?: string | null;
    tracking_url?: string | null;
  } = { status };

  if (carriesTracking) {
    patch.courier = trimmed(formData.get("courier"), 80) || null;
    patch.tracking_number = trimmed(formData.get("trackingNumber"), 120) || null;
    patch.tracking_url = normalizeTrackingUrl(trimmed(formData.get("trackingUrl"), 500));
  }

  const { error } = await supabase.from("orders").update(patch).eq("id", id);
  if (error) return;

  const after = { ...before, ...patch };
  const statusChanged = before.status !== status;
  const trackingChanged =
    carriesTracking &&
    (before.courier !== after.courier ||
      before.tracking_number !== after.tracking_number ||
      before.tracking_url !== after.tracking_url);

  const kind = STATUS_EMAIL[status];
  if (notify && kind && (statusChanged || trackingChanged)) {
    const { data: items } = await supabase
      .from("order_items")
      .select("title, quantity, unit_price, line_total")
      .eq("order_id", id);
    await sendOrderEmail(after as OrderForEmail, (items as ItemForEmail[]) ?? [], kind);
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function setOrderPayment(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const payment = String(formData.get("paymentStatus") ?? "") as PaymentStatus;
  if (!id || !PAYMENT_STATUS_IDS.includes(payment)) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("orders").update({ payment_status: payment }).eq("id", id);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function updateOrderNote(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("adminNote") ?? "").slice(0, 4000);
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("orders").update({ admin_note: note }).eq("id", id);
  revalidatePath("/admin/orders");
}

/** Hard-delete — for spam only. Real cancellations use status='cancelled'. */
export async function deleteOrder(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("orders").delete().eq("id", id);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

// ------------------------------------------------------------------- auth

// ------------------------------------------------------- atelier crafting prices

/**
 * Save the atelier price list.
 *
 * The form posts one field per editable number, named with the same
 * `group:option:field` key the price table uses. Every submitted key is checked
 * against PRICE_FIELD_BY_KEY before it is written, so a hand-crafted post
 * cannot invent rows for options that don't exist — the table has no foreign
 * key to lean on, because the options live in code rather than in Postgres.
 *
 * Rows are upserted on the (group_id, option_id, field) unique index. A blank
 * input means "fall back to the code default", so the row is deleted rather
 * than stored as zero — zero is a legitimate price (a ring's crafting premium
 * is 0) and must stay distinguishable from "unset".
 */
export async function saveCraftingPrices(formData: FormData) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const upserts: { group_id: string; option_id: string; field: string; value: number }[] = [];
  const clears: string[] = [];

  for (const def of PRICE_FIELDS) {
    const key = priceKey(def.group, def.optionId, def.field);
    if (!formData.has(key)) continue;

    const raw = String(formData.get(key) ?? "").trim();
    if (raw === "") {
      clears.push(key);
      continue;
    }

    const value = Number(raw);
    // Reject anything that isn't a sane non-negative number rather than writing
    // NaN into the quote engine.
    if (!Number.isFinite(value) || value < 0) continue;

    upserts.push({
      group_id: def.group,
      option_id: def.optionId,
      field: def.field,
      value,
    });
  }

  if (upserts.length > 0) {
    await supabase
      .from("crafting_prices")
      .upsert(upserts, { onConflict: "group_id,option_id,field" });
  }

  for (const key of clears) {
    const def = PRICE_FIELD_BY_KEY.get(key);
    if (!def) continue;
    await supabase
      .from("crafting_prices")
      .delete()
      .eq("group_id", def.group)
      .eq("option_id", def.optionId)
      .eq("field", def.field);
  }

  // The atelier is an ISR page holding a 60s copy of the old prices; drop it so
  // the next visitor is quoted the new ones immediately.
  revalidatePath("/admin/crafting-prices");
  revalidatePath("/atelier");
}

export async function signOut() {
  // Only a real admin session can sign out; harmless otherwise.
  if (await getAdminUser()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
