"use client";

import { useState, useTransition } from "react";
import {
  deleteOrder,
  setOrderPayment,
  setOrderStatus,
  updateOrderNote,
} from "@/app/admin/_actions";
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, formatMoney } from "@/lib/shop";
import { productImageUrl } from "@/lib/supabase/env";
import { formatDate } from "@/lib/leads";
import type {
  OrderEmailKind,
  OrderStatus,
  OrderWithItems,
} from "@/lib/supabase/types";

/**
 * Orders placed from the shop. Fulfilment and money move independently — a
 * piece can ship before the transfer clears, and the concierge needs to see both
 * — so `status` and `payment_status` are two separate rows of one-click pills.
 *
 * Setting a status emails the customer (unless the switch is off). The two
 * shipping states open a dialog first, because "it's on its way" is a poor email
 * without the courier and the tracking number in it.
 */

const FILTERS: { id: "all" | OrderStatus; label: string }[] = [
  { id: "all", label: "All" },
  ...ORDER_STATUSES.map((s) => ({ id: s.id, label: s.label })),
];

const EMAIL_LABEL: Record<OrderEmailKind, string> = {
  placed: "Order confirmation",
  confirmed: "Confirmed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  completed: "Delivered",
  cancelled: "Cancelled",
};

function statusMeta(id: string) {
  return ORDER_STATUSES.find((s) => s.id === id);
}

const dialogField =
  "mt-2 w-full rounded-xl border border-[var(--adm-line)] bg-[var(--adm-inset)] px-3.5 py-2.5 font-body text-sm text-[var(--adm-ink)] outline-none transition-colors placeholder:text-[var(--adm-faint)] focus:border-[var(--adm-accent)]";
const dialogLabel = "adm-label";

export default function OrdersView({
  orders,
  emailConfigured,
}: {
  orders: OrderWithItems[];
  /** False when RESEND_API_KEY isn't set — the switch would be a lie. */
  emailConfigured: boolean;
}) {
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(orders[0]?.id ?? null);
  const [notify, setNotify] = useState(true);
  const [trackingFor, setTrackingFor] = useState<OrderStatus | null>(null);
  const [saving, startSaving] = useTransition();

  const shown = orders.filter((o) => filter === "all" || o.status === filter);
  const selected = orders.find((o) => o.id === selectedId) ?? null;
  const notifyValue = notify && emailConfigured ? "1" : "0";

  // The dialog owns its submit so it can close itself once the action settles.
  const submitTracking = (formData: FormData) => {
    startSaving(async () => {
      await setOrderStatus(formData);
      setTrackingFor(null);
    });
  };

  const trackingStatus = trackingFor ? statusMeta(trackingFor) : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* List */}
      <div className="lg:col-span-2">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`adm-chip ${filter === f.id ? "adm-chip-on" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="adm-empty p-8 text-center font-body text-sm text-[var(--adm-muted)]">
            No orders here yet.
          </p>
        ) : (
          <div className="space-y-2">
            {shown.map((order) => {
              const meta = statusMeta(order.status);
              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedId(order.id)}
                  className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                    selectedId === order.id
                      ? "border-[var(--adm-accent)] bg-[var(--adm-accent-tint)]"
                      : "border-[var(--adm-line)] bg-white hover:border-[var(--adm-line-strong)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-body text-sm text-[var(--adm-ink)]">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: meta?.accent }}
                      />
                      {order.customer_name}
                    </span>
                    <span className="font-body text-[0.62rem] text-[var(--adm-muted)]">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 font-body text-[0.72rem] text-[var(--adm-ink-soft)]">
                    {order.items.map((i) => `${i.quantity}× ${i.title}`).join(", ") || "—"}
                  </p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <span className="font-sans text-[0.6rem] uppercase tracking-[0.12em] text-[var(--adm-accent)]">
                      {order.order_number}
                    </span>
                    <span className="font-body text-[0.7rem] text-[var(--adm-accent-strong)]">
                      {order.total > 0 ? formatMoney(order.total, order.currency) : "To be quoted"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail */}
      <div className="lg:col-span-3">
        {!selected ? (
          <p className="adm-empty p-10 text-center font-body text-sm text-[var(--adm-muted)]">
            Select an order to open it.
          </p>
        ) : (
          <div className="adm-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.25em] text-[var(--adm-accent)]">
                  {selected.order_number}
                </p>
                <h2 className="mt-1 font-serif text-2xl font-light text-[var(--adm-ink)]">
                  {selected.customer_name}
                </h2>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-body text-[0.8rem]">
                  <a href={`mailto:${selected.email}`} className="text-[var(--adm-accent-strong)] hover:text-[var(--adm-accent)]">
                    {selected.email}
                  </a>
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} className="text-[var(--adm-accent-strong)] hover:text-[var(--adm-accent)]">
                      {selected.phone}
                    </a>
                  )}
                </div>
              </div>
              <span className="font-body text-[0.66rem] text-[var(--adm-muted)]">
                {formatDate(selected.created_at)}
              </span>
            </div>

            {/* Items */}
            <div className="mt-5 space-y-2.5">
              {selected.items.map((item) => {
                const thumb = productImageUrl(item.image_path);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3.5 adm-inset p-3"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white">
                      {thumb && (
                        // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, straight from the bucket CDN
                        <img src={thumb} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-body text-sm text-[var(--adm-ink)]">{item.title}</p>
                      <p className="mt-0.5 font-sans text-[0.58rem] uppercase tracking-[0.16em] text-[var(--adm-muted)]">
                        {item.quantity} × {formatMoney(item.unit_price, selected.currency)}
                      </p>
                    </div>
                    <p className="shrink-0 font-body text-[0.85rem] text-[var(--adm-accent-strong)]">
                      {item.line_total == null
                        ? "Quote"
                        : formatMoney(item.line_total, selected.currency)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[var(--adm-line)] pt-3">
              <span className="adm-label">
                Total
              </span>
              <span className="font-serif text-xl font-light text-[var(--adm-ink)]">
                {selected.total > 0
                  ? formatMoney(selected.total, selected.currency)
                  : "To be quoted"}
              </span>
            </div>

            {/* Delivery */}
            {(selected.address_line1 || selected.city || selected.country) && (
              <div className="mt-5 adm-inset p-4">
                <p className="adm-label">
                  Deliver to
                </p>
                <p className="mt-2 whitespace-pre-line font-body text-[0.85rem] leading-relaxed text-[var(--adm-ink-soft)]">
                  {[
                    selected.address_line1,
                    selected.address_line2,
                    [selected.city, selected.postal_code].filter(Boolean).join(" "),
                    selected.country,
                  ]
                    .filter(Boolean)
                    .join("\n")}
                </p>
              </div>
            )}

            {/* Tracking, once there is any */}
            {(selected.tracking_number || selected.courier) && (
              <div className="mt-3 adm-inset p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="adm-label">
                      Tracking
                    </p>
                    {selected.courier && (
                      <p className="mt-2 font-body text-[0.85rem] text-[var(--adm-ink-soft)]">
                        {selected.courier}
                      </p>
                    )}
                    {selected.tracking_number && (
                      <p className="mt-0.5 font-sans text-[0.8rem] tracking-[0.08em] text-[var(--adm-ink)]">
                        {selected.tracking_number}
                      </p>
                    )}
                    {selected.tracking_url && (
                      <a
                        href={selected.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-block font-sans text-[0.58rem] uppercase tracking-[0.16em] text-[var(--adm-accent)] transition-colors hover:text-[var(--adm-accent)]"
                      >
                        Open tracking ↗
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setTrackingFor(
                        statusMeta(selected.status)?.tracked
                          ? selected.status
                          : "out_for_delivery",
                      )
                    }
                    className="shrink-0 adm-btn-ghost px-3.5 py-1.5"
                  >
                    Update
                  </button>
                </div>
              </div>
            )}

            {selected.note && (
              <div className="mt-4">
                <p className="adm-label">
                  From the customer
                </p>
                <p className="mt-1.5 whitespace-pre-wrap font-body text-[0.85rem] leading-relaxed text-[var(--adm-ink-soft)]">
                  {selected.note}
                </p>
              </div>
            )}

            {/* Fulfilment */}
            <div className="mt-6 border-t border-[var(--adm-line)] pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="adm-label">
                  Order status
                </p>
                <label
                  className={`flex items-center gap-2 font-body text-[0.75rem] ${
                    emailConfigured
                      ? "cursor-pointer text-[var(--adm-ink-soft)]"
                      : "cursor-not-allowed text-[var(--adm-faint)]"
                  }`}
                  title={
                    emailConfigured
                      ? "Send the matching email to the customer"
                      : "Add RESEND_API_KEY to send order emails"
                  }
                >
                  <input
                    type="checkbox"
                    checked={notify && emailConfigured}
                    disabled={!emailConfigured}
                    onChange={(e) => setNotify(e.target.checked)}
                    className="h-3.5 w-3.5 accent-[#f0b429]"
                  />
                  Email the customer
                </label>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {ORDER_STATUSES.map((s) => {
                  const active = selected.status === s.id;
                  const className = `rounded-full px-3.5 py-1.5 font-sans text-[0.6rem] uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                    active ? "ring-1 ring-inset" : "text-[var(--adm-ink-soft)] hover:text-[var(--adm-ink)]"
                  }`;
                  const style = active
                    ? { color: s.accent, backgroundColor: `${s.accent}1f` }
                    : undefined;

                  // Shipping states collect the courier + tracking number first.
                  return s.tracked ? (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setTrackingFor(s.id)}
                      className={className}
                      style={style}
                    >
                      {s.label}
                    </button>
                  ) : (
                    <form key={s.id} action={setOrderStatus}>
                      <input type="hidden" name="id" value={selected.id} />
                      <input type="hidden" name="status" value={s.id} />
                      <input type="hidden" name="notify" value={notifyValue} />
                      <button type="submit" className={className} style={style}>
                        {s.label}
                      </button>
                    </form>
                  );
                })}
              </div>

              <p className="mt-5 adm-label">
                Payment
              </p>
              {/* What the buyer SAID they would do, which is not what they have
                  done — the pills below are still the record of that. Read-only
                  on purpose: it is their statement, not ours to revise. */}
              {(() => {
                const method =
                  PAYMENT_METHODS.find((m) => m.id === selected.payment_method) ??
                  PAYMENT_METHODS[0];
                return (
                  <p
                    className="mt-1.5 font-sans text-[0.62rem] uppercase tracking-[0.14em]"
                    style={{ color: method.accent }}
                  >
                    {method.label}
                    {selected.payment_method === "transfer" &&
                      selected.payment_status === "unpaid" && (
                        <span className="ml-1.5 normal-case tracking-normal text-[var(--adm-ink-soft)]">
                          — expect {selected.order_number} as the reference
                        </span>
                      )}
                  </p>
                );
              })()}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {PAYMENT_STATUSES.map((s) => (
                  <form key={s.id} action={setOrderPayment}>
                    <input type="hidden" name="id" value={selected.id} />
                    <input type="hidden" name="paymentStatus" value={s.id} />
                    <button
                      type="submit"
                      className={`rounded-full px-3.5 py-1.5 font-sans text-[0.6rem] uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                        selected.payment_status === s.id
                          ? "ring-1 ring-inset"
                          : "text-[var(--adm-ink-soft)] hover:text-[var(--adm-ink)]"
                      }`}
                      style={
                        selected.payment_status === s.id
                          ? { color: s.accent, backgroundColor: `${s.accent}1f` }
                          : undefined
                      }
                    >
                      {s.label}
                    </button>
                  </form>
                ))}
              </div>
            </div>

            {/* What the customer has been told */}
            <div className="mt-6 border-t border-[var(--adm-line)] pt-5">
              <p className="adm-label">
                Emails sent
              </p>
              {selected.emails.length === 0 ? (
                <p className="mt-2 font-body text-[0.78rem] text-[var(--adm-muted)]">
                  {emailConfigured
                    ? "Nothing sent yet."
                    : "Order email is off — add RESEND_API_KEY to switch it on."}
                </p>
              ) : (
                <ul className="mt-2.5 space-y-1.5">
                  {selected.emails.map((email) => (
                    <li key={email.id} className="flex items-baseline gap-2.5">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: email.status === "sent" ? "#34d399" : "#fb7185",
                        }}
                      />
                      <span className="font-body text-[0.78rem] text-[var(--adm-ink-soft)]">
                        {EMAIL_LABEL[email.kind]}
                        <span className="ml-2 text-[var(--adm-muted)]">{formatDate(email.created_at)}</span>
                        {email.status === "failed" && (
                          <span className="ml-2 text-[var(--adm-danger)]">— {email.error}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Concierge note */}
            <form action={updateOrderNote} className="mt-6">
              <input type="hidden" name="id" value={selected.id} />
              <label
                htmlFor={`order-note-${selected.id}`}
                className="adm-label"
              >
                Internal note
              </label>
              <textarea
                id={`order-note-${selected.id}`}
                name="adminNote"
                rows={3}
                key={selected.id}
                defaultValue={selected.admin_note ?? ""}
                placeholder="Invoice sent, courier booked, sizing confirmed…"
                className="mt-2 w-full resize-none rounded-xl border border-[var(--adm-line)] bg-[var(--adm-inset)] px-3.5 py-2.5 font-body text-[0.82rem] text-[var(--adm-ink)] outline-none transition-colors placeholder:text-[var(--adm-faint)] focus:border-[var(--adm-accent)]"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <button
                  type="submit"
                  className="adm-btn-ghost"
                >
                  Save note
                </button>
              </div>
            </form>

            <form action={deleteOrder} className="mt-6 border-t border-[var(--adm-line)] pt-4">
              <input type="hidden" name="id" value={selected.id} />
              <button
                type="submit"
                className="adm-danger-link"
              >
                Delete order (spam only — real cancellations use Cancelled)
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ---------------------------------------------- courier dialog ---- */}
      {selected && trackingFor && trackingStatus && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#13294b]/25 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tracking-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) setTrackingFor(null);
          }}
        >
          <form
            action={submitTracking}
            className="w-full max-w-md rounded-2xl border border-[var(--adm-line)] bg-white p-6 shadow-[var(--adm-shadow-lift)]"
          >
            <input type="hidden" name="id" value={selected.id} />
            <input type="hidden" name="status" value={trackingFor} />
            <input type="hidden" name="notify" value={notifyValue} />

            <h2
              id="tracking-dialog-title"
              className="font-serif text-xl font-light text-[var(--adm-ink)]"
            >
              Mark as {trackingStatus.label.toLowerCase()}
            </h2>
            <p className="mt-1.5 font-body text-[0.8rem] leading-relaxed text-[var(--adm-ink-soft)]">
              {notifyValue === "1"
                ? "The customer gets an email with whatever tracking you enter here. Leave it blank if there is none."
                : "Email is switched off, so this only records the tracking on the order."}
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="tracking-courier" className={dialogLabel}>
                  Courier
                </label>
                <input
                  id="tracking-courier"
                  name="courier"
                  maxLength={80}
                  defaultValue={selected.courier ?? ""}
                  placeholder="DHL Express, SingPost, hand delivery…"
                  className={dialogField}
                />
              </div>
              <div>
                <label htmlFor="tracking-number" className={dialogLabel}>
                  Tracking number
                </label>
                <input
                  id="tracking-number"
                  name="trackingNumber"
                  maxLength={120}
                  autoFocus
                  defaultValue={selected.tracking_number ?? ""}
                  placeholder="e.g. 1234567890"
                  className={dialogField}
                />
              </div>
              <div>
                <label htmlFor="tracking-url" className={dialogLabel}>
                  Tracking link <span className="normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  id="tracking-url"
                  name="trackingUrl"
                  maxLength={500}
                  defaultValue={selected.tracking_url ?? ""}
                  placeholder="dhl.com/track?id=…"
                  className={dialogField}
                />
              </div>
            </div>

            <div className="mt-7 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="adm-btn disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              >
                {saving
                  ? "Saving…"
                  : notifyValue === "1"
                    ? "Save & email customer"
                    : "Save"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => setTrackingFor(null)}
                className="font-sans text-[0.6rem] uppercase tracking-[0.16em] text-[var(--adm-ink-soft)] transition-colors hover:text-[var(--adm-accent)] cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
