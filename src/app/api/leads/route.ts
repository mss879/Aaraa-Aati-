import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/supabase/env";
import { estimatePrice, sanitizeConfig } from "@/lib/ring-options";
import {
  cleanText,
  getClientIp,
  hashIp,
  isEmailish,
  isSameOrigin,
  rateLimit,
} from "@/lib/server/security";

/**
 * POST /api/leads
 * Creates a CRM lead the moment a visitor enters the atelier. Body:
 *   { name, phone, email?, config?, company? }   (company = honeypot)
 * Returns { leadId }. All writes use the service role after validation + a
 * per-IP rate limit. Fails gracefully so the atelier funnel is never blocked.
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
    return NextResponse.json({ leadId: null, ok: true });
  }

  const name = cleanText(body.name, 120);
  const phone = cleanText(body.phone, 40);
  const emailRaw = cleanText(body.email, 160).toLowerCase();
  const email = emailRaw && isEmailish(emailRaw) ? emailRaw : null;

  if (!name || !phone) {
    return NextResponse.json(
      { error: "Name and phone are required." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();

  // Per-IP spam guard: 15 new leads / hour.
  const ipKey = `lead:ip:${hashIp(getClientIp(req))}`;
  if (!(await rateLimit(supabase, ipKey, 15, 3600))) {
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
    .from("leads")
    .insert({
      name,
      phone,
      email,
      source: "atelier",
      stage: "new",
      config,
      estimated_price,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not save lead." }, { status: 500 });
  }

  return NextResponse.json({ leadId: data.id });
}
