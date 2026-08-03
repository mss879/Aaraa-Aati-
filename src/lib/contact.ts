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

/**
 * The published telephone line. It IS the WhatsApp line — one number answers
 * both — so it is derived from the number above rather than written out a
 * second time. A hardcoded copy is exactly how the site ended up advertising a
 * second, wrong number alongside the real one.
 *
 * E.164 for `tel:` hrefs and schema.org; the display form reuses the same
 * spacing logic as WHATSAPP_DISPLAY.
 */
export const TELEPHONE_E164 = `+${WHATSAPP_NUMBER}`;
export const TELEPHONE_DISPLAY = WHATSAPP_DISPLAY;

/** Where enquiries land, and the address on the maison's schema.org record. */
export const SUPPORT_EMAIL = "support@ceylongemmaison.com";

/** The Singapore atelier, by appointment. */
export const ATELIER_ADDRESS = {
  street: "66 Flora Road, #05-10, The Gale",
  locality: "Singapore",
  postalCode: "506912",
  country: "SG",
} as const;

export const INSTAGRAM_URL =
  "https://www.instagram.com/ceylongemmaison?igsh=enJ4YzVyMnYxenZ2&utm_source=qr";
export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61592437971310";
export const LINKEDIN_URL = "https://www.linkedin.com/company/ceylon-gem-maison/";
