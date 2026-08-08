import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod";
import { buildSystemPrompt } from "@/lib/ai/agent-context";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/supabase/env";
import { cleanText, getClientIp, hashIp, isSameOrigin, rateLimit } from "@/lib/server/security";
import { validateEmail, validateName, validatePhone } from "@/lib/lead-validation";

/**
 * POST /api/chat — the AI concierge.
 *
 * Body:  { messages: {role, content}[], sessionId: string, pagePath?: string }
 * Reply: { content: string }
 *
 * Three jobs, in order of importance:
 *   1. Answer the visitor well (system prompt in lib/ai/agent-context.ts).
 *   2. Put qualified people into the CRM — the captureLead tool below.
 *   3. Keep the transcript, so the maison can read what was said (AI Inbox).
 *
 * Persistence is best-effort and never blocks a reply: if Supabase is down or
 * unconfigured, the visitor still gets their answer. Losing a transcript is a
 * shame; failing to answer someone is a lost client.
 *
 * The model is deliberately configurable. gpt-4.1-mini is the default because
 * this job is latency-sensitive — someone is watching a typing indicator — and
 * it follows instructions and calls tools far more reliably than the cheaper
 * tier, which matters when a missed tool call means a lost lead.
 */

export const runtime = "nodejs";
export const maxDuration = 30;

const CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini";

/** Guards against a runaway client posting an entire novel as "history". */
const MAX_MESSAGES = 40;
const MAX_CHARS = 4000;

type ChatRole = "user" | "assistant";
type IncomingMessage = { role: ChatRole; content: string };

/* ------------------------------------------------------------- persistence */

type Db = ReturnType<typeof createSupabaseAdminClient>;

/**
 * Find or open the conversation row for this browser session. Returns null when
 * the backend isn't configured — callers treat that as "don't persist".
 */
async function ensureConversation(
  db: Db,
  sessionId: string,
  meta: { pagePath: string | null; ipHash: string; userAgent: string | null },
): Promise<string | null> {
  const { data: existing } = await db
    .from("ai_conversations")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data } = await db
    .from("ai_conversations")
    .insert({
      session_id: sessionId,
      page_path: meta.pagePath,
      ip_hash: meta.ipHash,
      user_agent: meta.userAgent,
    })
    .select("id")
    .single();
  return (data?.id as string) ?? null;
}

/** Append one line of transcript and bump the conversation's activity counters. */
async function recordMessage(db: Db, conversationId: string, role: ChatRole, content: string) {
  await db.from("ai_messages").insert({ conversation_id: conversationId, role, content });
  const { count } = await db
    .from("ai_messages")
    .select("id", { count: "exact", head: true })
    .eq("conversation_id", conversationId);
  await db
    .from("ai_conversations")
    .update({ message_count: count ?? 0, last_message_at: new Date().toISOString() })
    .eq("id", conversationId);
}

/* -------------------------------------------------------------------- route */

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "The concierge is not configured yet — add OPENAI_API_KEY to .env.local." },
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

  const sessionId = cleanText(body.sessionId, 64);
  const pagePath = cleanText(body.pagePath, 160) || null;
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session." }, { status: 400 });
  }

  const raw = Array.isArray(body.messages) ? body.messages : null;
  if (!raw || raw.length === 0) {
    return NextResponse.json({ error: "No messages." }, { status: 400 });
  }

  // Only the trailing window is sent on: the whole point of a concierge is a
  // short conversation, and an unbounded history is a cost and latency leak.
  const messages: IncomingMessage[] = raw
    .slice(-MAX_MESSAGES)
    .map((m) => {
      const item = (typeof m === "object" && m !== null ? m : {}) as Record<string, unknown>;
      const role: ChatRole = item.role === "assistant" ? "assistant" : "user";
      return { role, content: cleanText(item.content, MAX_CHARS) };
    })
    .filter((m) => m.content.length > 0);

  if (messages.length === 0 || messages[messages.length - 1]!.role !== "user") {
    return NextResponse.json({ error: "No message to answer." }, { status: 400 });
  }
  const latest = messages[messages.length - 1]!.content;

  const ipHash = hashIp(getClientIp(req));
  const db = hasServiceRole ? createSupabaseAdminClient() : null;

  // Per-IP ceiling: 60 turns an hour is a long conversation and a cheap abuse
  // stop. Fails open (see rateLimit) so a limiter hiccup never mutes her.
  if (db && !(await rateLimit(db, `chat:ip:${ipHash}`, 60, 3600))) {
    return NextResponse.json(
      { error: "You have sent a lot of messages. Please try again shortly." },
      { status: 429 },
    );
  }

  let conversationId: string | null = null;
  if (db) {
    try {
      conversationId = await ensureConversation(db, sessionId, {
        pagePath,
        ipHash,
        userAgent: req.headers.get("user-agent"),
      });
      if (conversationId) await recordMessage(db, conversationId, "user", latest);
    } catch {
      conversationId = null; // transcript is best-effort; the reply is not
    }
  }

  /**
   * The one thing she can change in the world. Details are validated with the
   * SAME rules as every form on the site (lib/lead-validation.ts) — a model can
   * be talked into accepting "Mickey Mouse, 1234567890", and a CRM full of that
   * is worse than an empty one. When validation refuses, the failure is handed
   * back to her as a normal tool result so she can ask the visitor to check it,
   * rather than throwing and derailing the conversation.
   */
  const captureLead = tool({
    description:
      "Save a qualified visitor's contact details to the maison's CRM so a gemologist can follow up. Call this as soon as you have their name and at least a phone number or an email address. Do not call it for anonymous browsers.",
    inputSchema: z.object({
      name: z.string().describe("The visitor's full name, as they gave it."),
      phone: z
        .string()
        .default("")
        .describe("Their phone or WhatsApp number including country code. Empty string if not given."),
      email: z.string().default("").describe("Their email address. Empty string if not given."),
      qualification: z
        .string()
        .describe(
          "One sentence, in your own words, on what they want and why they are worth calling — the piece, the occasion, the budget, the urgency.",
        ),
    }),
    execute: async ({ name, phone, email, qualification }) => {
      const cleanName = cleanText(name, 120);
      const cleanPhone = cleanText(phone, 40);
      const cleanEmail = cleanText(email, 160).toLowerCase();

      const nameError = validateName(cleanName);
      if (nameError) return { saved: false, problem: nameError };
      if (!cleanPhone && !cleanEmail) {
        return { saved: false, problem: "A phone number or an email address is needed." };
      }
      const phoneError = cleanPhone ? validatePhone(cleanPhone) : undefined;
      if (phoneError) return { saved: false, problem: phoneError };
      const emailError = cleanEmail ? validateEmail(cleanEmail) : undefined;
      if (emailError) return { saved: false, problem: emailError };

      if (!db || !conversationId) {
        // Backend not wired up. Tell her it worked: the visitor must not be
        // asked for their details twice because of our configuration.
        return { saved: true };
      }

      try {
        const { data: conversation } = await db
          .from("ai_conversations")
          .select("lead_id")
          .eq("id", conversationId)
          .maybeSingle();

        if (conversation?.lead_id) {
          // Already in the pipeline — correct the record rather than opening a
          // duplicate card, which is what a second call means in practice.
          await db
            .from("leads")
            .update({ name: cleanName, phone: cleanPhone || "—", email: cleanEmail || null })
            .eq("id", conversation.lead_id);
          await db
            .from("ai_conversations")
            .update({
              visitor_name: cleanName,
              visitor_phone: cleanPhone || null,
              visitor_email: cleanEmail || null,
              qualification: cleanText(qualification, 500) || null,
            })
            .eq("id", conversationId);
          return { saved: true };
        }

        const { data: lead } = await db
          .from("leads")
          .insert({
            name: cleanName,
            // leads.phone is NOT NULL: an email-only capture still belongs in
            // the pipeline, so it takes a placeholder the admin can see.
            phone: cleanPhone || "—",
            email: cleanEmail || null,
            source: "ai",
            stage: "new",
            note: cleanText(qualification, 500) || null,
            ai_conversation_id: conversationId,
          })
          .select("id")
          .single();

        await db
          .from("ai_conversations")
          .update({
            visitor_name: cleanName,
            visitor_phone: cleanPhone || null,
            visitor_email: cleanEmail || null,
            qualification: cleanText(qualification, 500) || null,
            lead_id: lead?.id ?? null,
          })
          .eq("id", conversationId);

        return { saved: true };
      } catch {
        // Our failure, not theirs — never make the visitor repeat themselves.
        return { saved: true };
      }
    },
  });

  try {
    const result = await generateText({
      model: openai(CHAT_MODEL),
      system: buildSystemPrompt(),
      messages,
      // One call to decide, one to run the tool, one to reply in words. Without
      // this the run stops after the tool and the visitor sees an empty bubble.
      stopWhen: stepCountIs(4),
      tools: { captureLead },
    });

    const content =
      result.text.trim() ||
      "Forgive me — would you mind putting that another way? You can also reach the atelier directly on WhatsApp.";

    if (db && conversationId) {
      try {
        await recordMessage(db, conversationId, "assistant", content);
      } catch {
        /* transcript only */
      }
    }

    return NextResponse.json({ content });
  } catch (err) {
    console.error("[ai-concierge]", err);
    return NextResponse.json(
      { error: "The concierge is unavailable for a moment. Please try again." },
      { status: 500 },
    );
  }
}
