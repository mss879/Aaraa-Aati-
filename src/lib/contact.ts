/**
 * The maison's public contact channels — one source of truth for the footer,
 * the enquiry form and the atelier's WhatsApp hand-off.
 *
 * These are committed rather than read from the environment because they are
 * public business details, and `.env.local` is gitignored: an env-only number
 * silently disappears on a fresh deploy and the WhatsApp buttons vanish with it.
 * NEXT_PUBLIC_WHATSAPP_NUMBER still overrides, so the line can be switched
 * per environment without a code change.
 */

/** Country code + number, digits only — the form wa.me expects. */
export const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "6587989863"
).replace(/\D/g, "");

/**
 * Display form, derived from the number above rather than written out beside it.
 * Hardcoding the pretty version let the label and the link drift apart the moment
 * the env override held a different line — which is exactly what happened.
 */
export const WHATSAPP_DISPLAY = (() => {
  const sg = /^65(\d{4})(\d{4})$/.exec(WHATSAPP_NUMBER);
  if (sg) return `+65 ${sg[1]} ${sg[2]}`;
  return `+${WHATSAPP_NUMBER}`;
})();

/** A wa.me deep link, with an optional prefilled message. */
export function whatsAppLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const INSTAGRAM_URL =
  "https://www.instagram.com/ceylongemmaison?igsh=enJ4YzVyMnYxenZ2&utm_source=qr";
export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61592437971310";
export const LINKEDIN_URL = "https://www.linkedin.com/company/ceylon-gem-maison/";
