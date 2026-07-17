import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Footer from "@/components/Footer";
import ScrollFX from "@/components/fx/ScrollFX";
import LuxeCursor from "@/components/fx/LuxeCursor";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services — Bespoke Jewellery, Sapphire Sourcing & Concierge",
  description:
    "Bespoke wedding and engagement rings, instant online quotations, Ceylon sapphire sourcing, virtual consultations and private concierge — Ceylon Gem Maison's services for clients in Singapore.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <main className="relative flex min-h-screen w-full select-none flex-col bg-[#F7F4EC]">
      <ScrollFX />
      <LuxeCursor />

      <PageHero
        eyebrow="Private Client Services · Singapore & Worldwide"
        title="Served Like"
        titleAccent="a Patron"
        body="From a gemologist at your door to the atelier's private vaults — three ways the maison bends around your life, not the other way around."
        image={{ src: "/bracelet_model.png", position: "center 25%" }}
      />

      {/* White island */}
      <div className="relative z-20 flex w-full flex-col bg-[#F7F4EC]">
        {/* Index strip */}
        <section className="w-full border-b border-zinc-200 px-6 py-14 md:px-12">
          <div data-reveal-group className="mx-auto flex max-w-7xl flex-wrap gap-x-8 gap-y-3">
            {SERVICES.map((service, i) => (
              <a
                key={service.slug}
                href={`#${service.slug}`}
                className="group flex items-baseline gap-2.5 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-[#5E7495] transition-colors hover:text-amber-700"
              >
                <span className="font-serif text-amber-600">{String(i + 1).padStart(2, "0")}</span>
                <span className="border-b border-transparent pb-0.5 transition-colors group-hover:border-amber-600">
                  {service.name}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Service chapters */}
        {SERVICES.map((service, i) => (
          <section
            key={service.slug}
            id={service.slug}
            className={`w-full scroll-mt-6 px-6 py-20 md:px-12 md:py-28 ${
              i % 2 === 1 ? "bg-[#F7F4EC]" : ""
            } ${i > 0 ? "border-t border-zinc-200" : ""}`}
          >
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20">
              {/* Left: number + name */}
              <div data-reveal>
                <span className="font-serif text-6xl font-light text-amber-600/25 md:text-7xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-4 font-serif text-3xl font-normal leading-[1.15] tracking-wide text-[#13294B] md:text-4xl">
                  {service.name}
                </h2>
                <p className="mt-4 font-sans text-[0.72rem] font-medium uppercase tracking-[0.25em] text-amber-700">
                  {service.tagline}
                </p>
              </div>

              {/* Right: detail */}
              <div data-reveal className="flex flex-col justify-center space-y-6">
                {service.paragraphs.map((para) => (
                  <p key={para.slice(0, 32)} className="max-w-2xl font-body text-sm leading-relaxed text-[#3A4E6B] md:text-base">
                    {para}
                  </p>
                ))}
                {service.points && (
                  <ul className="space-y-3.5 border-t border-zinc-200 pt-6">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rotate-45 bg-amber-600" />
                        <span className="font-body text-[0.85rem] leading-relaxed text-[#4A6285] md:text-sm">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {service.cta && (
                  <div className="pt-2">
                    <Link
                      href={service.cta.href}
                      className="inline-block rounded-full bg-[#12305B] px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#F7F4EC] transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-700"
                    >
                      {service.cta.label}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}

        {/* Closing invite */}
        <section className="w-full border-t border-[#1D3D6B] bg-[#0D2347] px-6 py-24 text-center md:px-12 md:py-32">
          <div data-reveal className="mx-auto max-w-2xl space-y-8">
            <span className="block font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-gold-300">
              Unsure Where to Begin?
            </span>
            <h2 className="font-serif text-4xl font-normal leading-[1.15] tracking-wide text-white md:text-5xl">
              Start With
              <br />
              <span className="italic font-light text-gold-300">a Conversation</span>
            </h2>
            <p className="mx-auto max-w-xl font-body text-sm leading-relaxed text-[#C9D4E6] md:text-base">
              Tell the concierge what you are dreaming of — a stone, a budget,
              an occasion — and we will shape the rest around you.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
              <Link
                href="/contact"
                className="w-full rounded-full bg-gold-400 px-8 py-3.5 text-center font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_4px_25px_rgba(46,91,224,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold-300 sm:w-auto"
              >
                Contact the Concierge
              </Link>
              <Link
                href="/atelier"
                className="w-full rounded-full border border-gold-400/25 px-8 py-3.5 text-center font-sans text-xs font-medium uppercase tracking-[0.2em] text-gold-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-300/50 hover:bg-gold-500/10 sm:w-auto"
              >
                Try the Digital Atelier
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
