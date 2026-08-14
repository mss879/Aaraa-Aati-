"use client";

import { useState } from "react";
import Link from "next/link";
import { MAX_ORDER_QUANTITY, formatMoney } from "@/lib/shop";
import { WHATSAPP_NUMBER } from "@/lib/contact";
import BankTransferPanel from "@/components/shop/BankTransferPanel";
import type { PaymentMethod } from "@/lib/supabase/types";

/**
 * Place an order for one piece.
 *
 * There is no card checkout and no basket — the maison confirms availability,
 * sizing and shipping by hand, then invoices. So this is one honest form: who
 * you are, where it goes, how many. The price is re-read on the server; nothing
 * here is trusted.
 *
 * Pieces that need no fitting can also be settled there and then by bank
 * transfer (`allowTransfer`, decided from the category and the price — see
 * lib/shop.ts). A ring cannot: it is sized to one finger, and that conversation
 * has to happen before the house takes money for it. The server re-derives this
 * either way; the prop only decides what the buyer is shown.
 */

const inputClasses =
  "w-full bg-transparent border-b border-zinc-300 py-2.5 font-body text-sm md:text-base text-[#13294B] placeholder-zinc-400 focus:outline-none focus:border-amber-600 transition-colors";
const labelClasses =
  "block font-sans text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[#5E7495] mb-1";

export default function OrderForm({
  productId,
  productTitle,
  price,
  currency,
  inStock,
  allowTransfer = false,
}: {
  productId: string;
  productTitle: string;
  price: number | null;
  currency: string;
  inStock: boolean;
  allowTransfer?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  /* Defaults to the way the house has always sold, even where transfer is on
     offer: the buyer opts in to paying now, rather than discovering they have
     been asked to. */
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("invoice");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Singapore");
  const [note, setNote] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /* The placed order as the SERVER recorded it — reference, amount and the
     method it actually accepted. The confirmation quotes these rather than the
     local state, so what the buyer is told to wire is what the house wrote
     down, even if the server declined the transfer they asked for. */
  const [placed, setPlaced] = useState<{
    orderNumber: string;
    total: number | null;
    currency: string;
    paymentMethod: PaymentMethod;
  } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
          paymentMethod,
          name,
          email,
          phone,
          address1,
          address2,
          city,
          postalCode,
          country,
          note,
          company,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Your order could not be placed. Please try again.");
      }
      /* Coerced rather than type-checked: Postgres `numeric` reaches JSON as a
         number today, but a string would fail a `typeof` test silently and the
         buyer would be shown "to be confirmed" in place of the figure they are
         meant to wire. NaN and null both fall back honestly. */
      const total = data.total == null || data.total === "" ? NaN : Number(data.total);
      setPlaced({
        orderNumber: typeof data.orderNumber === "string" ? data.orderNumber : "—",
        total: Number.isFinite(total) ? total : null,
        currency: typeof data.currency === "string" ? data.currency : currency,
        paymentMethod: data.paymentMethod === "transfer" ? "transfer" : "invoice",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (placed) {
    const byTransfer = placed.paymentMethod === "transfer";
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
        <h3 className="font-serif text-2xl font-normal tracking-wide text-[#13294B]">
          Your order is with us
        </h3>
        <p className="mt-3 font-body text-sm leading-relaxed text-[#4A6285] md:text-base">
          Reference <span className="font-medium text-[#13294B]">{placed.orderNumber}</span>.{" "}
          {byTransfer ? (
            <>
              The details for your transfer are below, and are on their way to you by email as well.
              A gemologist will write within one business day to confirm the piece and the delivery,
              and again once your payment reaches us.
            </>
          ) : (
            <>
              A gemologist will write within one business day to confirm the piece, sizing and
              delivery, and to arrange payment. Nothing has been charged.
            </>
          )}
        </p>

        {byTransfer && (
          <BankTransferPanel
            className="mt-7"
            orderNumber={placed.orderNumber}
            amount={placed.total}
            currency={placed.currency}
          />
        )}

        {WHATSAPP_NUMBER && (
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              `Hello — I've just placed order ${placed.orderNumber} for the ${productTitle}.`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex btn-platinum"
          >
            Continue on WhatsApp
          </a>
        )}
      </div>
    );
  }

  if (!inStock) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-8">
        <h3 className="font-serif text-xl font-normal tracking-wide text-[#13294B]">
          Currently reserved
        </h3>
        <p className="mt-3 font-body text-sm leading-relaxed text-[#4A6285]">
          This piece is spoken for. The maison can cut its twin — the stone will differ, as stones
          do.
        </p>
        <Link href="/contact" className="mt-6 inline-flex btn-luxe-pill">
          Ask the Concierge
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
      {!open ? (
        <>
          <p className="font-body text-sm leading-relaxed text-[#4A6285] md:text-base">
            {allowTransfer
              ? "This piece needs no fitting, so it can be settled straight away by bank transfer — or invoiced after a gemologist has confirmed availability and delivery with you."
              : "Orders are confirmed by a gemologist before anything is charged — availability, sizing and shipping are settled with you first."}
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-7 w-full cursor-pointer btn-luxe-pill sm:w-auto"
          >
            Place an Order
          </button>
        </>
      ) : (
        <form onSubmit={submit}>
          <h3 className="font-serif text-2xl font-normal tracking-wide text-[#13294B]">
            Order this piece
          </h3>
          <p className="mt-2 font-body text-sm leading-relaxed text-[#4A6285]">
            {productTitle} · {formatMoney(price, currency)}
          </p>

          <div className="mt-8 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="order-name" className={labelClasses}>
                  Full Name
                </label>
                <input
                  id="order-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Amara Perera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="order-email" className={labelClasses}>
                  Email
                </label>
                <input
                  id="order-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="order-phone" className={labelClasses}>
                  Phone
                </label>
                <input
                  id="order-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+65 9123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="order-quantity" className={labelClasses}>
                  Quantity
                </label>
                <select
                  id="order-quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className={`${inputClasses} cursor-pointer`}
                >
                  {Array.from({ length: MAX_ORDER_QUANTITY }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="order-address1" className={labelClasses}>
                Delivery Address
              </label>
              <input
                id="order-address1"
                type="text"
                autoComplete="address-line1"
                placeholder="Street and number"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                className={inputClasses}
              />
              <input
                id="order-address2"
                type="text"
                autoComplete="address-line2"
                aria-label="Apartment, unit or floor"
                placeholder="Apartment, unit or floor (optional)"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                className={`${inputClasses} mt-3`}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="order-city" className={labelClasses}>
                  City
                </label>
                <input
                  id="order-city"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Singapore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="order-postal" className={labelClasses}>
                  Postal Code
                </label>
                <input
                  id="order-postal"
                  type="text"
                  autoComplete="postal-code"
                  placeholder="238823"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="order-country" className={labelClasses}>
                  Country
                </label>
                <input
                  id="order-country"
                  type="text"
                  autoComplete="country-name"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Offered only where the piece needs no fitting. A ring is absent
                from here on purpose — see the note above the component. */}
            {allowTransfer && (
              <fieldset>
                <legend className={labelClasses}>How would you like to settle?</legend>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      {
                        id: "invoice" as const,
                        title: "Invoice me",
                        body: "We confirm the piece first, then send an invoice. Nothing is charged now.",
                      },
                      {
                        id: "transfer" as const,
                        title: "Bank transfer",
                        body: "Our account details arrive with your confirmation, quoting this order as the reference.",
                      },
                    ]
                  ).map((option) => {
                    const selected = paymentMethod === option.id;
                    return (
                      <label
                        key={option.id}
                        className={`cursor-pointer rounded-2xl border p-4 transition-colors ${
                          selected
                            ? "border-amber-600 bg-amber-50/40"
                            : "border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        <span className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="order-payment-method"
                            value={option.id}
                            checked={selected}
                            onChange={() => setPaymentMethod(option.id)}
                            className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-amber-600"
                          />
                          <span className="min-w-0">
                            <span className="block font-sans text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[#13294B]">
                              {option.title}
                            </span>
                            <span className="mt-1.5 block font-body text-[0.82rem] leading-relaxed text-[#4A6285]">
                              {option.body}
                            </span>
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <div>
              <label htmlFor="order-note" className={labelClasses}>
                Anything we should know?{" "}
                <span className="normal-case tracking-normal text-[#A9B8D0]">(optional)</span>
              </label>
              <textarea
                id="order-note"
                rows={3}
                placeholder="Ring size, engraving, the date you need it by…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={`${inputClasses} resize-none`}
              />
            </div>
          </div>

          {/* Honeypot — hidden from humans, catches naive bots. */}
          <div aria-hidden className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
            <label htmlFor="order-company">Company</label>
            <input
              id="order-company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={sending}
              className="w-full cursor-pointer btn-luxe-pill disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {sending ? "Placing…" : "Confirm Order"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer font-sans text-[0.7rem] uppercase tracking-[0.2em] text-[#5E7495] transition-colors hover:text-[#13294B]"
            >
              Cancel
            </button>
          </div>

          <p className="mt-5 font-body text-[0.78rem] leading-relaxed text-[#5E7495]">
            {allowTransfer && paymentMethod === "transfer"
              ? "No card is charged here. You will receive our account details and your order reference, and send the transfer yourself."
              : "No payment is taken here. We confirm the piece, then send an invoice."}
          </p>

          {error && (
            <p className="mt-4 font-body text-[0.85rem] leading-relaxed text-rose-600" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
