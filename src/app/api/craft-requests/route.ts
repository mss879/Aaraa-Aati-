import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/supabase/env";
import { estimatePrice, sanitizeConfig } from "@/lib/ring-options";
import {
  cleanText,
  getClientIp,
  hashIp,
  isSameOrigin,
  rateLimit,
} from "@/lib/server/security";
import { validateEmail, validateName, validatePhone } from "@/lib/lead-validation";

/**
 * POST /api/craft-requests
 * Opens a bespoke commission when a visitor passes the atelier gate. Body:
 *   { name, phone, email?, config?, company? }   (company = honeypot)
 * Returns { requestId }.
 *
 * This lands in the Crafting inbox, NOT the CRM — the admin promotes the ones
 * worth working (Admin → Crafting → Send to CRM), exactly as with contact-form
 * inquiries. All writes use the service role after validation + a per-IP rate
 * limit, and the route fails gracefully so the design funnel is never blocked.
 */

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!hasServiceRole) {
    return NextResponse.json(
      { error: "The backend is not configured yet." },
      { status: 503 },
    );
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

  // Honeypot: real users never fill this. Pretend success, persist nothing.
  if (cleanText(body.company, 100)) {
    return NextResponse.json({ requestId: null, ok: true });
  }

  const name = cleanText(body.name, 120);
  const phone = cleanText(body.phone, 40);
  const email = cleanText(body.email, 160).toLowerCase();

  /* The same rules the atelier prompt applies, run again here. The client check
     is a courtesy to the visitor; this one is the actual gate — nothing stops a
     script POSTing straight at this route, and the Crafting inbox is only worth
     opening if what lands in it can be dialled and written to. Email is
     required now, not optional: a commission's quotation and certificate go by
     mail, so a request without one is not workable. */
  const invalid =
    validateName(name) ??
    validatePhone(phone) ??
    validateEmail(email);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Per-IP spam guard: 15 new commissions / hour.
  const ipHash = hashIp(getClientIp(req));
  if (!(await rateLimit(supabase, `craft:ip:${ipHash}`, 15, 3600))) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  // Config is optional at gate time; when present, snapshot + price it.
  let config = null;
  let estimated_price: number | null = null;
  if (body.config && typeof body.config === "object") {
    config = sanitizeConfig(body.config);
    estimated_price = estimatePrice(config);
  }

  const { data, error } = await supabase
    .from("craft_requests")
    .insert({
      name,
      phone,
      email,
      config,
      estimated_price,
      status: "new",
      ip_hash: ipHash,
      user_agent: req.headers.get("user-agent"),
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not start your commission." }, { status: 500 });
  }

  return NextResponse.json({ requestId: data.id });
}
