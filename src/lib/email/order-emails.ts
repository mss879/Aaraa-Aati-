import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasServiceRole } from "@/lib/supabase/env";
import { formatMoney } from "@/lib/shop";
import { BANK_TRANSFER, bankTransferRows, paymentReference } from "@/lib/bank";
import { ORDERS_NOTIFY_EMAIL, sendEmail, type SendResult } from "@/lib/email/resend";
import type { Order, OrderEmailKind, OrderItem } from "@/lib/supabase/types";

/**
 * The maison's transactional email.
 *
 * One template, six voices: the confirmation the moment an order arrives, then
 * one per fulfilment state the admin sets. Every send is written to
 * `order_emails` — sent or failed — so the dashboard shows what the customer has
 * actually been told. Nothing here throws: an order must never fail because the
 * mail did.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ceylongemmaison.com";
const HOUSE_EMAIL = process.env.RESEND_REPLY_TO || "support@ceylongemmaison.com";

/** The fields an email actually needs — so callers can pass a partial row. */
export type OrderForEmail = Pick<
  Order,
  | "id"
  | "order_number"
  | "customer_name"
  | "email"
  | "currency"
  | "total"
  | "address_line1"
  | "address_line2"
  | "city"
  | "postal_code"
  | "country"
  | "payment_method"
  | "courier"
  | "tracking_number"
  | "tracking_url"
>;

export type ItemForEmail = Pick<OrderItem, "title" | "quantity" | "unit_price" | "line_total">;

/** Everything interpolated into the HTML is customer-supplied. Escape it. */
function esc(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const COPY: Record<
  OrderEmailKind,
  { subject: (n: string) => string; heading: string; lines: string[] }
> = {
  placed: {
    subject: (n) => `We have your order · ${n}`,
    heading: "Your order is with us",
    lines: [
      "Thank you — this is the maison confirming we have your order. Nothing has been charged.",
      "A gemologist will write within one business day to confirm the piece, sizing and delivery, and to arrange payment.",
    ],
  },
  confirmed: {
    subject: (n) => `Your order is confirmed · ${n}`,
    heading: "Your order is confirmed",
    lines: [
      "The piece is now reserved in your name and is being prepared for despatch.",
      "An invoice with payment details follows separately, if it has not reached you already.",
    ],
  },
  shipped: {
    subject: (n) => `Your order has shipped · ${n}`,
    heading: "It has left the atelier",
    lines: [
      "Your piece has been packed, insured and handed to the courier.",
      "We will write again the day it goes out for delivery.",
    ],
  },
  out_for_delivery: {
    subject: (n) => `Out for delivery today · ${n}`,
    heading: "Out for delivery today",
    lines: [
      "Your piece is with the courier and is due to arrive today.",
      "Someone will need to be there to sign for it — jewellery is never left at a door.",
    ],
  },
  completed: {
    subject: (n) => `Delivered · ${n}`,
    heading: "Delivered — wear it well",
    lines: [
      "Your piece has been delivered. It leaves our ledger and enters yours.",
      "Keep the certification with it. Whenever it needs cleaning, tightening or resizing, write to us — structural work on our own pieces is guaranteed for life.",
    ],
  },
  cancelled: {
    subject: (n) => `Your order has been cancelled · ${n}`,
    heading: "Your order has been cancelled",
    lines: [
      "This order has been cancelled and nothing further will be charged.",
      "If this was not what you intended, reply to this email and we will put it right.",
    ],
  },
};

/**
 * The account block, for an order the buyer said they would wire.
 *
 * Rendered from the same lib/bank.ts rows as the on-site panel, so the email and
 * the confirmation screen cannot come to list the account differently — and
 * built as a table with inline styles like the rest of this file, because mail
 * clients are not browsers.
 *
 * The reference sits at the top in its own bordered cell for the same reason it
 * does on the site: an unreferenced transfer is an anonymous sum.
 */
function bankPanel(order: OrderForEmail): string {
  const rows = bankTransferRows()
    .map(
      (row) => `
        <tr>
          <td style="padding:7px 0;font:600 10px/1.4 'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#5E7495;white-space:nowrap;vertical-align:top;width:130px;">
            ${esc(row.label)}${row.overseasOnly ? ' <span style="text-transform:none;letter-spacing:0;color:#A9B8D0;">(from abroad)</span>' : ""}
          </td>
          <td style="padding:7px 0;font:400 14px/1.5 Georgia,'Times New Roman',serif;color:#13294B;">
            ${esc(row.value)}
          </td>
        </tr>`,
    )
    .join("");

  return `<tr>
            <td style="padding:24px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F3;border:1px solid #E7E2D5;">
                <tr>
                  <td style="padding:18px 20px;">
                    <div style="font:600 10px/1 'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:.28em;text-transform:uppercase;color:#5E7495;">
                      Payment by bank transfer
                    </div>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;background:#ffffff;border:1px solid rgba(180,140,40,.32);">
                      <tr>
                        <td style="padding:12px 14px;">
                          <div style="font:600 10px/1 'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#5E7495;">
                            Reference — please quote
                          </div>
                          <div style="margin-top:5px;font:400 18px/1.3 Georgia,'Times New Roman',serif;letter-spacing:.04em;color:#13294B;">
                            ${esc(paymentReference(order.order_number))}
                          </div>
                        </td>
                        <td align="right" style="padding:12px 14px;">
                          <div style="font:600 10px/1 'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#5E7495;">
                            Amount
                          </div>
                          <div style="margin-top:5px;font:400 18px/1.3 Georgia,'Times New Roman',serif;color:#13294B;white-space:nowrap;">
                            ${esc(order.total > 0 ? formatMoney(order.total, order.currency) : "To be confirmed")}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                      ${rows}
                    </table>

                    <div style="margin-top:12px;font:400 12px/1.6 Georgia,'Times New Roman',serif;color:#5E7495;">
                      Transfers within ${esc(BANK_TRANSFER.country)} need only the bank and branch codes; from abroad, use the SWIFT code and the bank&rsquo;s address. Your piece is held for you from now — we write again the day your payment reaches us.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function addressLines(order: OrderForEmail): string[] {
  return [
    order.address_line1,
    order.address_line2,
    [order.city, order.postal_code].filter(Boolean).join(" ").trim() || null,
    order.country,
  ].filter((line): line is string => Boolean(line && line.trim()));
}

function trackingLines(order: OrderForEmail): string[] {
  const lines: string[] = [];
  if (order.courier) lines.push(`Courier: ${order.courier}`);
  if (order.tracking_number) lines.push(`Tracking number: ${order.tracking_number}`);
  if (order.tracking_url) lines.push(`Track it: ${order.tracking_url}`);
  return lines;
}

export function renderOrderEmail(
  order: OrderForEmail,
  items: ItemForEmail[],
  kind: OrderEmailKind,
): { subject: string; html: string; text: string } {
  const copy = COPY[kind];
  const subject = copy.subject(order.order_number);
  const address = addressLines(order);
  const tracking = trackingLines(order);
  const showTracking = tracking.length > 0 && (kind === "shipped" || kind === "out_for_delivery");

  /* The account goes out with the two mails where the buyer still owes money
     and has said they will wire it. Not on 'shipped' or 'completed': repeating
     bank details after a piece has been paid for and sent is how a second,
     unwanted payment gets made — and it is what a spoofed invoice looks like. */
  const showBank =
    order.payment_method === "transfer" && (kind === "placed" || kind === "confirmed");

  /* Both of these mails otherwise promise an invoice — "to arrange payment",
     "an invoice follows separately" — which contradicts the account details
     printed directly underneath. A buyer told to wait for an invoice will wait,
     and the piece sits unpaid in the dashboard while everyone is being polite. */
  const lines = showBank
    ? kind === "placed"
      ? [
          "Thank you — this is the maison confirming we have your order. Nothing has been charged: the transfer is yours to send, using the details below.",
          "A gemologist will write within one business day to confirm the piece and the delivery, and again the day your payment reaches us.",
        ]
      : [
          "The piece is now reserved in your name and is being prepared for despatch.",
          "Our account details are repeated below should you still need them. Please quote your order number as the reference.",
        ]
    : copy.lines;

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #EFEAE0;font:400 15px/1.4 Georgia,'Times New Roman',serif;color:#13294B;">
            ${esc(item.title)}
            <span style="display:block;font:400 12px/1.4 'Helvetica Neue',Helvetica,Arial,sans-serif;color:#5E7495;letter-spacing:.06em;">
              Quantity ${item.quantity}
            </span>
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #EFEAE0;font:400 15px/1.4 Georgia,'Times New Roman',serif;color:#13294B;white-space:nowrap;">
            ${esc(
              item.line_total == null
                ? "To be quoted"
                : formatMoney(item.line_total, order.currency),
            )}
          </td>
        </tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#F7F4EC;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(lines[0])}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4EC;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #E7E2D5;">

          <tr>
            <td style="background:#0D2347;padding:24px 32px;">
              <div style="font:600 11px/1 'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:.34em;text-transform:uppercase;color:#8FB0F8;">
                Ceylon Gem Maison
              </div>
              <div style="margin-top:6px;font:400 11px/1 'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#6C86B4;">
                Order ${esc(order.order_number)}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 32px 8px;">
              <h1 style="margin:0;font:400 26px/1.25 Georgia,'Times New Roman',serif;color:#13294B;letter-spacing:.02em;">
                ${esc(copy.heading)}
              </h1>
              <p style="margin:18px 0 0;font:400 15px/1.65 Georgia,'Times New Roman',serif;color:#4A6285;">
                Dear ${esc(order.customer_name)},
              </p>
              ${lines
                .map(
                  (line) =>
                    `<p style="margin:14px 0 0;font:400 15px/1.65 Georgia,'Times New Roman',serif;color:#4A6285;">${esc(line)}</p>`,
                )
                .join("")}
            </td>
          </tr>

          ${
            showTracking
              ? `<tr>
            <td style="padding:24px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9FC;border:1px solid #E2E8F2;">
                <tr>
                  <td style="padding:18px 20px;">
                    <div style="font:600 10px/1 'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:.28em;text-transform:uppercase;color:#5E7495;">
                      Tracking
                    </div>
                    ${
                      order.courier
                        ? `<div style="margin-top:10px;font:400 14px/1.5 Georgia,'Times New Roman',serif;color:#13294B;">${esc(order.courier)}</div>`
                        : ""
                    }
                    ${
                      order.tracking_number
                        ? `<div style="margin-top:4px;font:600 16px/1.4 'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:.08em;color:#13294B;">${esc(order.tracking_number)}</div>`
                        : ""
                    }
                    ${
                      order.tracking_url
                        ? `<div style="margin-top:12px;"><a href="${esc(order.tracking_url)}" style="font:600 11px/1 'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#1F46C4;text-decoration:underline;">Track your parcel</a></div>`
                        : ""
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
              : ""
          }

          <tr>
            <td style="padding:28px 32px 0;">
              <div style="font:600 10px/1 'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:.28em;text-transform:uppercase;color:#5E7495;">
                Your order
              </div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
                ${itemRows}
                <tr>
                  <td style="padding:14px 0 0;font:600 11px/1 'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#5E7495;">
                    Total
                  </td>
                  <td align="right" style="padding:14px 0 0;font:400 19px/1.2 Georgia,'Times New Roman',serif;color:#13294B;white-space:nowrap;">
                    ${esc(order.total > 0 ? formatMoney(order.total, order.currency) : "To be quoted")}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${showBank ? bankPanel(order) : ""}

          ${
            address.length
              ? `<tr>
            <td style="padding:26px 32px 0;">
              <div style="font:600 10px/1 'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:.28em;text-transform:uppercase;color:#5E7495;">
                Delivering to
              </div>
              <p style="margin:10px 0 0;font:400 14px/1.6 Georgia,'Times New Roman',serif;color:#4A6285;">
                ${address.map((line) => esc(line)).join("<br>")}
              </p>
            </td>
          </tr>`
              : ""
          }

          <tr>
            <td style="padding:30px 32px 34px;">
              <p style="margin:0;font:400 15px/1.65 Georgia,'Times New Roman',serif;color:#4A6285;">
                With our regards,<br>Ceylon Gem Maison
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px;border-top:1px solid #EFEAE0;background:#FBFAF6;">
              <p style="margin:0;font:400 12px/1.7 'Helvetica Neue',Helvetica,Arial,sans-serif;color:#5E7495;">
                Questions about this order? Simply reply to this email, or write to
                <a href="mailto:${esc(HOUSE_EMAIL)}" style="color:#1F46C4;text-decoration:underline;">${esc(HOUSE_EMAIL)}</a>.
              </p>
              <p style="margin:10px 0 0;font:400 11px/1.6 'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:.06em;color:#93A3BC;">
                <a href="${esc(SITE_URL)}" style="color:#93A3BC;text-decoration:none;">${esc(SITE_URL.replace(/^https?:\/\//, ""))}</a>
                · Hand-cut Ceylon stones, set in Singapore.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `CEYLON GEM MAISON — Order ${order.order_number}`,
    "",
    copy.heading,
    "",
    `Dear ${order.customer_name},`,
    "",
    ...lines,
    ...(showTracking ? ["", "TRACKING", ...tracking] : []),
    "",
    "YOUR ORDER",
    ...items.map(
      (item) =>
        `- ${item.title} × ${item.quantity} — ${
          item.line_total == null ? "To be quoted" : formatMoney(item.line_total, order.currency)
        }`,
    ),
    `Total: ${order.total > 0 ? formatMoney(order.total, order.currency) : "To be quoted"}`,
    ...(showBank
      ? [
          "",
          "PAYMENT BY BANK TRANSFER",
          `Reference (please quote): ${paymentReference(order.order_number)}`,
          `Amount: ${order.total > 0 ? formatMoney(order.total, order.currency) : "To be confirmed"}`,
          ...bankTransferRows().map(
            (row) => `${row.label}${row.overseasOnly ? " (from abroad)" : ""}: ${row.value}`,
          ),
          `Transfers within ${BANK_TRANSFER.country} need only the bank and branch codes; from abroad, use the SWIFT code and the bank's address.`,
        ]
      : []),
    ...(address.length ? ["", "DELIVERING TO", ...address] : []),
    "",
    "With our regards,",
    "Ceylon Gem Maison",
    "",
    `Questions? Reply to this email or write to ${HOUSE_EMAIL}.`,
    SITE_URL,
  ].join("\n");

  return { subject, html, text };
}

/** Record the attempt so the dashboard can show what the customer was told. */
async function logOrderEmail(entry: {
  orderId: string;
  kind: OrderEmailKind;
  to: string;
  subject: string;
  result: SendResult;
}) {
  if (!hasServiceRole) return;
  try {
    await createSupabaseAdminClient()
      .from("order_emails")
      .insert({
        order_id: entry.orderId,
        kind: entry.kind,
        to_email: entry.to,
        subject: entry.subject,
        status: entry.result.ok ? "sent" : "failed",
        provider_id: entry.result.ok ? entry.result.id : null,
        error: entry.result.ok ? null : entry.result.error.slice(0, 500),
      });
  } catch (err) {
    console.error("[order-emails] could not log send", err);
  }
}

/**
 * Send one order email and log it. Always resolves — the caller checks the
 * result only if it wants to surface a failure.
 */
export async function sendOrderEmail(
  order: OrderForEmail,
  items: ItemForEmail[],
  kind: OrderEmailKind,
): Promise<SendResult> {
  const { subject, html, text } = renderOrderEmail(order, items, kind);
  const result = await sendEmail({ to: order.email, subject, html, text });
  if (!result.ok) console.error(`[order-emails] ${kind} → ${order.email}: ${result.error}`);
  await logOrderEmail({ orderId: order.id, kind, to: order.email, subject, result });
  return result;
}

/**
 * Optional internal copy of a new order, to ORDERS_NOTIFY_EMAIL. Not logged in
 * order_emails — that table is the record of what the CUSTOMER was told.
 */
export async function notifyHouseOfOrder(
  order: OrderForEmail,
  items: ItemForEmail[],
): Promise<void> {
  if (!ORDERS_NOTIFY_EMAIL) return;
  const summary = items.map((i) => `${i.quantity} × ${i.title}`).join(", ");
  const total = order.total > 0 ? formatMoney(order.total, order.currency) : "to be quoted";
  await sendEmail({
    to: ORDERS_NOTIFY_EMAIL,
    subject: `New order ${order.order_number} — ${order.customer_name}`,
    html: `<p style="font:400 15px/1.6 Georgia,serif;color:#13294B;">
        <strong>${esc(order.order_number)}</strong> — ${esc(order.customer_name)}
        (<a href="mailto:${esc(order.email)}">${esc(order.email)}</a>)<br>
        ${esc(summary)}<br>Total: ${esc(total)}
      </p>
      <p style="font:400 13px/1.6 Georgia,serif;"><a href="${esc(SITE_URL)}/admin/orders">Open it in the back office</a></p>`,
    text: `${order.order_number} — ${order.customer_name} (${order.email})\n${summary}\nTotal: ${total}\n\n${SITE_URL}/admin/orders`,
  });
}
