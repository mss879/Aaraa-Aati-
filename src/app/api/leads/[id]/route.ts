import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/supabase/env";
import { estimatePrice, sanitizeConfig } from "@/lib/ring-options";
import {
  getClientIp,
  hashIp,
  isSameOrigin,
  rateLimit,
} from "@/lib/server/security";

/**
 * PATCH /api/leads/[id]
 * Enriches an existing atelier lead with the latest customization config as the
 * visitor progresses, so the CRM shows their design even if they never render.
 * Only the config/price are updatable here; nothing else is exposed publicly.
 * Next 16: params is a Promise.
 */

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!hasServiceRole) {
    return NextResponse.json({ error: "The backend is not configured yet." }, { status: 503 });
  }
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "Bad origin." }, { status: 403 });
  }

  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body.config || typeof body.config !== "object") {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  // Light per-IP guard against hammering (60 updates / hour).
  const ipKey = `leadpatch:ip:${hashIp(getClientIp(req))}`;
  if (!(await rateLimit(supabase, ipKey, 60, 3600))) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const config = sanitizeConfig(body.config);

  // Only update leads that came from the atelier and aren't yet in a later
  // stage — never let a public caller mutate a lead the admin is working.
  const { error } = await supabase
    .from("leads")
    .update({ config, estimated_price: estimatePrice(config) })
    .eq("id", id)
    .eq("source", "atelier")
    .eq("stage", "new");

  if (error) {
    return NextResponse.json({ error: "Could not update lead." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
