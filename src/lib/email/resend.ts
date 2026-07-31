import "server-only";

/**
 * Resend transport.
 *
 * Called against the REST API with plain fetch rather than the SDK: one
 * documented endpoint, no dependency to keep in step, and it runs unchanged on
 * every runtime. Everything here is best-effort — a mail that fails must never
 * take an order down with it, so nothing throws.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** The verified sender in your Resend account (Domains → Add domain). */
export const RESEND_FROM =
  process.env.RESEND_FROM || "Ceylon Gem Maison <orders@ceylongemmaison.com>";

/** Where a customer's reply lands — the maison's own inbox. */
export const RESEND_REPLY_TO = process.env.RESEND_REPLY_TO || "support@ceylongemmaison.com";

/** Optional: an internal address that receives a copy of every new order. */
export const ORDERS_NOTIFY_EMAIL = process.env.ORDERS_NOTIFY_EMAIL || "";

export const hasResend = Boolean(process.env.RESEND_API_KEY);

export type SendResult =
  | { ok: true; id: string | null }
  | { ok: false; error: string };

export async function sendEmail(message: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not set — no email was sent." };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [message.to],
        reply_to: RESEND_REPLY_TO,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
      // Never let a hung provider hold an order route open.
      signal: AbortSignal.timeout(10_000),
    });

    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      return { ok: false, error: data.message || `Resend responded ${res.status}.` };
    }
    return { ok: true, id: data.id ?? null };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "The email could not be sent.",
    };
  }
}
