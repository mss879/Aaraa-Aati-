import type { Metadata } from "next";
import { Suspense } from "react";
import PageHero from "@/components/PageHero";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import ScrollFX from "@/components/fx/ScrollFX";
import LuxeCursor from "@/components/fx/LuxeCursor";

export const metadata: Metadata = {
  title: "Contact & Private Appointments",
  description:
    "Reach the Ceylon Gem Maison concierge — enquiries, private viewings at the Colombo atelier, bespoke commissions, and lifetime care for your pieces.",
};

const CHANNELS = [
  {
    label: "The Flagship Atelier",
    lines: ["No. 12, Galle Face Terrace", "Colombo 03, Sri Lanka"],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    label: "By Telephone",
    lines: ["+94 11 234 5678"],
    href: "tel:+94112345678",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    label: "By Email",
    lines: ["atelier@ceylongemmaison.com"],
    href: "mailto:atelier@ceylongemmaison.com",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    label: "Atelier Hours",
    lines: ["Monday – Saturday · 10.00 – 19.00", "Sunday · By appointment only"],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const FAQS = [
  {
    q: "Do you accept bespoke commissions?",
    a: "Yes — bespoke is the heart of the maison. Begin in the digital atelier or over a private consultation; from first sketch to final fitting typically takes six to ten weeks.",
  },
  {
    q: "How are your gemstones sourced?",
    a: "Every sapphire and diamond is bought at source from licensed Sri Lankan mines with full chain-of-custody documentation. We never buy from mixed parcels, and papers accompany every piece.",
  },
  {
    q: "Do you ship internationally?",
    a: "We deliver worldwide by fully insured, hand-carried courier. Within Colombo, pieces are delivered personally by a member of the atelier.",
  },
  {
    q: "What does the lifetime warranty cover?",
    a: "Structure, settings, and stones — for life. Bring a piece home to the atelier at any age and we will restore it, re-polish it, and re-certify it without question.",
  },
];

export default function ContactPage() {
  return (
    <main className="relative flex min-h-screen w-full select-none flex-col bg-[#070708] p-[10px]">
      <ScrollFX />
      <LuxeCursor />

      <PageHero
        eyebrow="Concierge & Appointments"
        title="Begin a"
        titleAccent="Conversation"
        body="A gemologist — never a bot — answers every enquiry. Write to us about a piece, a stone, or an occasion, and we will take it from there."
        image={{ src: "/bracelet_model.png", position: "center 25%" }}
      />

      {/* White island */}
      <div className="relative z-20 mt-[10px] flex w-full flex-col overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-[#FAF9F6] shadow-[0_-20px_50px_rgba(0,0,0,0.35)] md:rounded-[3rem]">

        {/* ---- Channels + form ---- */}
        <section className="w-full px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20">

            {/* Ways to reach us */}
            <div data-reveal className="flex flex-col justify-center">
              <div className="mb-6 inline-flex items-center gap-2.5 self-start rounded-full border border-amber-500/20 bg-amber-500/5 px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-700">
                  The Concierge
                </span>
              </div>
              <h2 className="font-serif text-4xl font-normal leading-[1.15] tracking-wide text-zinc-900 md:text-5xl">
                Every Channel,
                <br />
                <span className="italic font-light text-amber-600">One Gemologist</span>
              </h2>
              <p className="mt-6 max-w-lg font-sans text-sm leading-relaxed text-zinc-700 md:text-base">
                Whether you write, call, or walk in from Galle Face, you will
                speak with someone who has held the stones — and who will stay
                with you from first enquiry to final fitting.
              </p>

              <div className="mt-10 space-y-7 border-t border-zinc-200 pt-10">
                {CHANNELS.map((channel) => (
                  <div key={channel.label} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-amber-500/15 bg-amber-500/5 text-amber-700">
                      {channel.icon}
                    </div>
                    <div>
                      <p className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.2em] text-zinc-500">
                        {channel.label}
                      </p>
                      {channel.lines.map((line) =>
                        channel.href ? (
                          <a
                            key={line}
                            href={channel.href}
                            className="mt-1 block font-sans text-sm text-zinc-800 transition-colors hover:text-amber-700 md:text-base"
                          >
                            {line}
                          </a>
                        ) : (
                          <p key={line} className="mt-1 font-sans text-sm text-zinc-800 md:text-base">
                            {line}
                          </p>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enquiry form (reads ?piece= → needs Suspense for useSearchParams) */}
            <div data-reveal="right">
              <Suspense fallback={null}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </section>

        {/* ---- FAQ ---- */}
        <section className="w-full border-t border-zinc-200 bg-white px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-4xl">
            <div data-reveal className="mb-12 text-center md:mb-16">
              <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-700">
                Before You Write
              </span>
              <h2 className="mt-4 font-serif text-4xl font-normal leading-[1.15] tracking-wide text-zinc-900 md:text-5xl">
                Often
                <span className="italic font-light text-amber-600"> Asked</span>
              </h2>
            </div>

            <div data-reveal className="divide-y divide-zinc-200 border-y border-zinc-200">
              {FAQS.map((faq) => (
                <details key={faq.q} className="group py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-lg text-zinc-900 transition-colors group-open:text-amber-700 md:text-xl [&::-webkit-details-marker]:hidden">
                    {faq.q}
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 transition-all duration-300 group-open:rotate-45 group-open:border-amber-600 group-open:text-amber-700">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-4 max-w-2xl font-sans text-[0.85rem] leading-relaxed text-zinc-600 md:text-sm">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Private appointment band (dark) ---- */}
        <section className="w-full border-t border-zinc-900 bg-[#0b0b0c] px-6 py-24 text-center md:px-12 md:py-32">
          <div data-reveal className="mx-auto max-w-2xl space-y-8">
            <span className="block font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-gold-300">
              By Private Appointment
            </span>
            <h2 className="font-serif text-4xl font-normal leading-[1.15] tracking-wide text-white md:text-5xl">
              The Vault Room
              <br />
              <span className="italic font-light text-gold-300">Awaits</span>
            </h2>
            <p className="mx-auto max-w-xl font-sans text-sm leading-relaxed text-zinc-300 md:text-base">
              Unmounted Ceylon sapphires, investment-grade stones, and the
              heritage archive are shown only in person. Appointments are held
              in complete privacy, with the atelier closed to other visitors.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
              <a
                href="mailto:atelier@ceylongemmaison.com?subject=Private%20Vault%20Appointment"
                className="w-full rounded-full bg-gold-400 px-8 py-3.5 text-center font-sans text-xs font-semibold uppercase tracking-[0.2em] text-obsidian-950 shadow-[0_4px_25px_rgba(212,175,55,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-300 hover:shadow-[0_4px_35px_rgba(212,175,55,0.45)] active:translate-y-0 sm:w-auto"
              >
                Request an Appointment
              </a>
              <a
                href="tel:+94112345678"
                className="w-full rounded-full border border-gold-400/25 px-8 py-3.5 text-center font-sans text-xs font-medium uppercase tracking-[0.2em] text-gold-200 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-300/60 hover:bg-gold-500/10 active:translate-y-0 sm:w-auto"
              >
                Call the Atelier
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
