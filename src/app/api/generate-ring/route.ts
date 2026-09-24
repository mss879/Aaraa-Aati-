import { NextResponse } from "next/server";
import { buildJewelPrompt, estimatePrice, sanitizeConfig } from "@/lib/ring-options";
import { getQuoteTable } from "@/lib/crafting-prices";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { GENERATIONS_BUCKET, hasServiceRole } from "@/lib/supabase/env";
import { getClientIp, hashIp, isSameOrigin, rateLimit } from "@/lib/server/security";

/**
 * POST /api/generate-ring
 * Renders the configured piece as a photoreal product shot via OpenAI's image
 * model, then —
 * when the Supabase backend is configured — persists the render (image in the
 * private ring-generations bucket + a generations row linked to the open craft
 * request) and enforces anti-abuse controls.
 *
 * Body: { ...RingConfig, requestId }  ·  Response: { image: "data:image/png;base64,...", config }
 *
 * Security (active only when the backend is configured):
 *   - same-origin check
 *   - gated: a well-formed requestId (from the atelier's contact gate) is required
 *   - durable rate limits: per-IP (hour + day) and per-request (hour)
 *   - client IP stored only as a salted hash
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2.5-flare";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "The AI atelier is not configured yet — add your OPENAI_API_KEY to .env.local and restart the server.",
      },
      { status: 503 },
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const config = sanitizeConfig(payload);
  const prompt = buildJewelPrompt(config);
  const requestId = typeof payload.requestId === "string" ? payload.requestId : "";

  // ---- Anti-abuse + persistence (only when the backend is wired up) ---------
  const backend = hasServiceRole;
  const supabase = backend ? createSupabaseAdminClient() : null;

  if (backend && supabase) {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Bad origin." }, { status: 403 });
    }
    // Gated: the render must originate from a visitor who passed the atelier's
    // contact gate (which hands back a craft-request id).
    if (!UUID_RE.test(requestId)) {
      return NextResponse.json(
        { error: "Please start your design from the atelier." },
        { status: 400 },
      );
    }

    const ipHash = hashIp(getClientIp(req));
    const [ipHour, ipDay, perRequest] = await Promise.all([
      rateLimit(supabase, `gen:ip:${ipHash}`, 10, 3600),
      rateLimit(supabase, `gen:ipday:${ipHash}`, 25, 86400),
      rateLimit(supabase, `gen:req:${requestId}`, 6, 3600),
    ]);
    if (!ipHour || !ipDay || !perRequest) {
      return NextResponse.json(
        {
          error:
            "You've reached the render limit for now. Please continue on WhatsApp, or try again later.",
        },
        { status: 429 },
      );
    }
  }

  // ---- Generate ------------------------------------------------------------
  const mime = "image/png";
  let base64: string;
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt,
        size: "1024x1024",
        quality: "medium",
        output_format: "png",
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      data?: { b64_json?: string }[];
      error?: { message?: string; code?: string };
    };

    if (!res.ok) {
      const message = data.error?.message || `HTTP ${res.status}`;
      console.error("[generate-ring]", res.status, data.error?.code, message);
      const friendly =
        res.status === 401 || res.status === 403
          ? "The OpenAI API key was rejected — double-check OPENAI_API_KEY."
          : res.status === 429
            ? "The AI atelier is briefly over capacity. Please try again in a moment."
            : data.error?.code === "moderation_blocked"
              ? "The atelier couldn't render this combination. Try adjusting the design and render again."
              : "The render failed unexpectedly. Please try again.";
      return NextResponse.json({ error: friendly }, { status: 502 });
    }

    const b64 = data.data?.[0]?.b64_json;
    if (!b64) {
      if (backend && supabase) {
        await recordGeneration(supabase, {
          requestId,
          config,
          prompt,
          ipHash: hashIp(getClientIp(req)),
          userAgent: req.headers.get("user-agent"),
          status: "failed",
          imagePath: null,
          mime: null,
        });
      }
      return NextResponse.json(
        { error: "The model returned no image. Please try again." },
        { status: 502 },
      );
    }

    base64 = b64;
  } catch (err) {
    console.error("[generate-ring]", err);
    return NextResponse.json(
      { error: "The render failed unexpectedly. Please try again." },
      { status: 502 },
    );
  }

  // ---- Persist (best-effort; never blocks the visitor's reveal) ------------
  if (backend && supabase) {
    try {
      const ext = mime.includes("jpeg") || mime.includes("jpg") ? "jpg" : "png";
      const buffer = Buffer.from(base64, "base64");
      // Only link to a craft request that actually exists (avoids an FK
      // violation if the gate's insert had failed and the client fell back to a
      // stray id). promoted_lead_id keeps the render on the CRM card too, once
      // the request has been sent to the pipeline.
      const { data: request } = await supabase
        .from("craft_requests")
        .select("id, promoted_lead_id")
        .eq("id", requestId)
        .maybeSingle();
      const linkedRequestId = request?.id ?? null;

      const path = `${linkedRequestId ?? "anon"}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(GENERATIONS_BUCKET)
        .upload(path, buffer, { contentType: mime, upsert: false });

      await recordGeneration(supabase, {
        requestId: linkedRequestId,
        leadId: request?.promoted_lead_id ?? null,
        config,
        prompt,
        ipHash: hashIp(getClientIp(req)),
        userAgent: req.headers.get("user-agent"),
        status: "done",
        imagePath: upErr ? null : path,
        mime,
      });
    } catch (err) {
      console.error("[generate-ring persist]", err);
      // swallow — the render still returns to the visitor below
    }
  }

  return NextResponse.json({ image: `data:${mime};base64,${base64}`, config });
}

/** Insert one generations row. Best-effort; errors are logged, not thrown. */
async function recordGeneration(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  args: {
    requestId: string | null;
    /** Set only once the craft request has been promoted into the CRM. */
    leadId?: string | null;
    config: ReturnType<typeof sanitizeConfig>;
    prompt: string;
    ipHash: string;
    userAgent: string | null;
    status: "done" | "failed";
    imagePath: string | null;
    mime: string | null;
  },
) {
  const { error } = await supabase.from("generations").insert({
    craft_request_id: args.requestId,
    lead_id: args.leadId ?? null,
    config: args.config,
    estimated_price: estimatePrice(args.config, await getQuoteTable()),
    prompt: args.prompt,
    image_path: args.imagePath,
    image_mime: args.mime,
    status: args.status,
    ip_hash: args.ipHash,
    user_agent: args.userAgent,
  });
  if (error) console.error("[generate-ring recordGeneration]", error.message);
}
