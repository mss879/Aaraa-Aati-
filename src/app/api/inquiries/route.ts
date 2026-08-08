import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/supabase/env";
import {
  cleanText,
  getClientIp,
  hashIp,
  isSameOrigin,
  rateLimit,
} from "@/lib/server/security";
import { validateEmail, validateName, validatePhone } from "@/lib/lead-validation";

/**
 * POST /api/inquiries
 * Persists a contact-form submission into the Inquiries queue (NOT the CRM — the
 * admin promotes good ones by hand). Body:
 *   { name, email, message, phone?, interest?, sourcePiece?, company? }
 * (company = honeypot.)
 */

export const runtime = "nodejs";

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
    return NextResponse.json({ ok: true });
  }

  const name = cleanText(body.name, 120);
  const email = cleanText(body.email, 160).toLowerCase();
  const message = cleanText(body.message, 4000);
  const phone = cleanText(body.phone, 40) || null;
  const interest = cleanText(body.interest, 80) || null;
  const source_piece = cleanText(body.sourcePiece, 120) || null;

  if (!message) {
    return NextResponse.json({ error: "Please tell us how we can help." }, { status: 400 });
  }
  /* Same rules as the atelier prompt. Phone stays optional on the contact form
     — a written enquiry is legitimate without one — but a number that IS given
     has to be dialable. */
  const invalid =
    validateName(name) ?? validateEmail(email) ?? (phone ? validatePhone(phone) : undefined);
  if (invalid) {
    return NextResponse.json({ error: invalid }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Per-IP guard: 8 inquiries / hour.
  const ipKey = `inquiry:ip:${hashIp(getClientIp(req))}`;
  if (!(await rateLimit(supabase, ipKey, 8, 3600))) {
    return NextResponse.json(
      { error: "Too many messages. Please try again shortly." },
      { status: 429 },
    );
  }

  const { error } = await supabase.from("inquiries").insert({
    name,
    email,
    phone,
    interest,
    message,
    source_piece,
    status: "new",
  });

  if (error) {
    return NextResponse.json({ error: "Could not send your message." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
