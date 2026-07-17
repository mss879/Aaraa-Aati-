"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

/* Same concierge lines as the atelier — set NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local. */
const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
const ATELIER_EMAIL = "support@ceylongemmaison.com";

const INTERESTS = [
  "A Bespoke Commission",
  "The Collections",
  "A Private Viewing",
  "Care & Restoration",
  "Something Else",
];

const inputClasses =
  "w-full bg-transparent border-b border-zinc-300 py-2.5 font-body text-sm md:text-base text-[#13294B] placeholder-zinc-400 focus:outline-none focus:border-amber-600 transition-colors";

const labelClasses =
  "block font-sans text-[0.68rem] font-medium uppercase tracking-[0.2em] text-[#5E7495] mb-1";

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

/**
 * ContactForm
 * Concierge enquiry form. There is no backend: submitting composes a
 * pre-filled email in the visitor's mail client, and the secondary action
 * hands the same message to the atelier's WhatsApp line. Arriving with
 * ?piece=<name> (from the collections gallery) pre-fills the enquiry.
 */
export default function ContactForm() {
  const piece = useSearchParams().get("piece");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState(piece ? "The Collections" : INTERESTS[0]);
  const [message, setMessage] = useState(
    piece ? `I would like to enquire about the ${piece}.` : "",
  );
  const [sent, setSent] = useState(false);

  const buildBody = () =>
    [
      `Name: ${name}`,
      `Email: ${email}`,
      phone && `Phone: ${phone}`,
      `Regarding: ${interest}`,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `${interest} — ${name || "Website enquiry"}`;
    window.location.href = `mailto:${ATELIER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildBody())}`;
    setSent(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] md:p-10"
    >
      <h3 className="font-serif text-2xl font-normal tracking-wide text-[#13294B] md:text-3xl">
        Send an Enquiry
      </h3>
      <p className="mt-2 font-body text-sm md:text-base leading-relaxed text-[#4A6285]">
        Every message is read by a gemologist, never a bot. We reply within one
        business day.
      </p>

      <div className="mt-8 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className={labelClasses}>
              Full Name
            </label>
            <input
              id="contact-name"
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
            <label htmlFor="contact-email" className={labelClasses}>
              Email
            </label>
            <input
              id="contact-email"
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
            <label htmlFor="contact-phone" className={labelClasses}>
              Phone <span className="normal-case tracking-normal text-[#A9B8D0]">(optional)</span>
            </label>
            <input
              id="contact-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+65 9123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="contact-interest" className={labelClasses}>
              Regarding
            </label>
            <select
              id="contact-interest"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              className={`${inputClasses} cursor-pointer`}
            >
              {INTERESTS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="contact-message" className={labelClasses}>
            Your Message
          </label>
          <textarea
            id="contact-message"
            required
            rows={4}
            placeholder="Tell us about the piece, the occasion, or the stone you have in mind…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClasses} resize-none`}
          />
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <button
          type="submit"
          className="w-full cursor-pointer rounded-full bg-[#12305B] px-8 py-3.5 text-center font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#F7F4EC] transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-700 active:translate-y-0 sm:w-auto"
        >
          Send Enquiry
        </button>
        {WHATSAPP_NUMBER && (
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildBody())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-zinc-300 px-8 py-3.5 font-sans text-xs font-medium uppercase tracking-[0.2em] text-[#2C405C] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-600 hover:text-emerald-700 active:translate-y-0 sm:w-auto"
          >
            <WhatsAppIcon />
            WhatsApp Us
          </a>
        )}
      </div>

      {sent && (
        <p className="mt-6 font-body text-[0.85rem] leading-relaxed text-emerald-700 md:text-sm" role="status">
          Your email client has opened with the enquiry — press send there and
          we will reply within one business day.
        </p>
      )}
    </form>
  );
}
