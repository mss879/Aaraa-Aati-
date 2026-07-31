import type { OrderStatus, PaymentStatus, ProductStatus } from "@/lib/supabase/types";

/** Shared shop vocabulary — used by both the storefront and the back office. */

export const MAX_PRODUCT_IMAGES = 5;
export const MAX_ORDER_QUANTITY = 10;
export const DEFAULT_CURRENCY = "SGD";

export const PRODUCT_STATUSES: { id: ProductStatus; label: string; accent: string }[] = [
  { id: "draft", label: "Draft", accent: "#8595ad" },
  { id: "active", label: "Live", accent: "#34d399" },
  { id: "archived", label: "Archived", accent: "#43536e" },
];

/**
 * The fulfilment ladder. `tracked` statuses open the courier dialog in the
 * dashboard before they are set, so the tracking number reaches the customer in
 * the same email that tells them the piece is moving.
 */
export const ORDER_STATUSES: {
  id: OrderStatus;
  label: string;
  accent: string;
  tracked?: boolean;
}[] = [
  { id: "pending", label: "Pending", accent: "#f0b429" },
  { id: "confirmed", label: "Confirmed", accent: "#4f7bee" },
  { id: "shipped", label: "Shipped", accent: "#a78bfa", tracked: true },
  { id: "out_for_delivery", label: "Out for delivery", accent: "#38bdf8", tracked: true },
  { id: "completed", label: "Completed", accent: "#34d399" },
  { id: "cancelled", label: "Cancelled", accent: "#8595ad" },
];

export const PAYMENT_STATUSES: { id: PaymentStatus; label: string; accent: string }[] = [
  { id: "unpaid", label: "Unpaid", accent: "#f0b429" },
  { id: "paid", label: "Paid", accent: "#34d399" },
  { id: "refunded", label: "Refunded", accent: "#fb7185" },
];

export const ORDER_STATUS_IDS = ORDER_STATUSES.map((s) => s.id);
export const PAYMENT_STATUS_IDS = PAYMENT_STATUSES.map((s) => s.id);
export const PRODUCT_STATUS_IDS = PRODUCT_STATUSES.map((s) => s.id);

/**
 * Money for display. A null price is not "$0" — it is a piece the maison quotes
 * by hand, so it reads as such everywhere.
 */
export function formatMoney(
  amount: number | null | undefined,
  currency: string = DEFAULT_CURRENCY,
): string {
  if (amount == null) return "Price upon request";
  try {
    const formatted = new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
    // en-SG renders SGD as a bare "$", which is ambiguous on an order sent to a
    // buyer abroad. The house sells from Singapore, so let it say so: S$.
    return currency === "SGD" && formatted.startsWith("$") ? `S${formatted}` : formatted;
  } catch {
    return `${currency} ${amount.toLocaleString("en-SG")}`;
  }
}

/** URL-safe slug from a product title. Falls back to a timestamp-free stub. */
export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip the accents NFKD just split off
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "piece";
}
