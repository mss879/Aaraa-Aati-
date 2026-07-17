import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Footer from "@/components/Footer";
import ScrollFX from "@/components/fx/ScrollFX";
import LuxeCursor from "@/components/fx/LuxeCursor";

export const metadata: Metadata = {
  title: "Our Story — The Maison Behind the Stone",
  description:
    "From years of exporting world-class, ethically sourced Ceylon gemstones to the West, to a bespoke sapphire atelier serving Singapore — the story of Ceylon Gem Maison.",
  alternates: { canonical: "/about" },
};

const STATS = [
  { value: "100%", label: "Traceable, Ethical Stones" },
  { value: "4–6", label: "Weeks per Commission" },
  { value: "24/7", label: "Concierge on WhatsApp" },
  { value: "∞", label: "Lifetime Atelier Warranty" },
];

const VALUES = [
  {
    title: "Ethical Sourcing",
    body: "Every sapphire and diamond is bought at source from licensed Ratnapura and Elahera mines, with full chain-of-custody papers from pit to plinth.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4.5v9L12 21l-7-4.5v-9L12 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M5 7.5l14 9M19 7.5l-14 9" />
      </svg>
    ),
  },
  {
    title: "Master Craftsmanship",
    body: "Our cutters apprentice for a decade before touching a client stone. Every facet is placed by hand, checked by eye, and signed in the house ledger.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
      </svg>
    ),
  },
  {
    title: "Lifetime Warranty",
    body: "Structure, settings and stones are guaranteed for life. Bring a piece home to the atelier at any age and we restore it without question.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Private Client Care",
    body: "One gemologist accompanies you from first sketch to final fitting — and remains your discreet point of contact for every acquisition after.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
];

const TIMELINE = [
  {
    year: "I",
    title: "The Export Years",
    body: "The maison's foundation: years of professional experience exporting world-class, ethically sourced Ceylon gemstones to discerning buyers across the West — certification, traceability and international quality standards as daily discipline.",
  },
  {
    year: "II",
    title: "From Exporter to Atelier",
    body: "The house turns its acumen to the bench: impeccably tailored wedding and engagement rings, and a specialisation in sapphires of every kind — cut and set for those who wish to treasure life-changing moments.",
  },
  {
    year: "III",
    title: "The New Normal",
    body: "Tested by the pandemic, the maison adapted rather than paused — welcoming clients through online channels, refining designs over video and WhatsApp, and serving them in the comfort of their own homes. The service never left.",
  },
  {
    year: "2026",
    title: "The Digital Atelier & Singapore",
    body: "The online platform launches at ceylongemmaison.com: quotations calculated the moment specifications are entered, harmonising design and budget — now serving clients across Singapore and beyond.",
  },
];

export default function AboutPage() {
  return (
    <main className="relative flex min-h-screen w-full select-none flex-col bg-[#F7F4EC]">
      <ScrollFX />
      <LuxeCursor />

      <PageHero
        eyebrow="Ratnapura · Colombo · Singapore"
        title="The Maison"
        titleAccent="Behind the Stone"
        body="Years of exporting world-class, ethically sourced gemstones to the West — refined into a maison dedicated to sapphires, and to the rings that mark life's defining moments."
        image={{ src: "/artisan_crafting.png", position: "center 30%" }}
      />

      {/* White island */}
      <div className="relative z-20 flex w-full flex-col bg-[#F7F4EC]">

        {/* ---- Story intro ---- */}
        <section className="w-full px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
            <div data-reveal className="flex flex-col justify-center">
              <div className="mb-6 inline-flex items-center gap-2.5 self-start rounded-full border border-amber-500/20 bg-amber-500/5 px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-700">
                  Our Story
                </span>
              </div>
              <p className="font-serif text-3xl font-light leading-[1.25] text-[#13294B] md:text-4xl lg:text-[2.75rem]">
                &ldquo;Jewellery for those who wish to
                <br />
                <span className="italic text-amber-600">treasure life-changing moments.</span>&rdquo;
              </p>
              <p className="mt-6 font-sans text-xs uppercase tracking-[0.25em] text-[#5E7495]">
                — The Maison Credo
              </p>
            </div>

            <div data-reveal className="flex flex-col justify-center space-y-6">
              <p className="max-w-2xl font-body text-sm leading-relaxed text-[#3A4E6B] md:text-base">
                Ceylon Gem Maison holds years of professional experience
                exporting world-class, ethically sourced gemstones from Sri
                Lanka to the West. That exporter&apos;s discipline — certification,
                traceability and uncompromising international quality standards
                — remains the foundation on which every commission is built.
              </p>
              <p className="max-w-2xl font-body text-sm leading-relaxed text-[#3A4E6B] md:text-base">
                Today the maison is dedicated to impeccably tailored wedding and
                engagement rings — a true epitome of elegance — and to the
                enthralling experience of crafting your own jewellery alongside
                our gemologists. Our specialisation lies in sapphires of every
                kind, intricately tailored for the moments that change a life.
              </p>
              <p className="max-w-2xl font-body text-sm leading-relaxed text-[#3A4E6B] md:text-base">
                We remain deliberately small. A handful of commissions leave the
                house each month, each bought at source, cut by hand, and built
                to be worn for a lifetime — then inherited.
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div data-reveal-group className="mx-auto mt-20 grid max-w-7xl grid-cols-2 gap-y-10 border-t border-zinc-200 pt-12 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <p className="font-serif text-4xl font-light text-[#13294B] md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 font-sans text-[0.7rem] font-medium uppercase tracking-[0.2em] text-amber-700">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ---- Values ---- */}
        <section id="values" className="w-full scroll-mt-6 border-t border-zinc-200 bg-[#F7F4EC] px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div data-reveal className="mb-14 max-w-2xl md:mb-20">
              <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-700">
                The House Pledge
              </span>
              <h2 className="mt-4 font-serif text-4xl font-normal leading-[1.15] tracking-wide text-[#13294B] md:text-5xl">
                What We Will
                <br />
                <span className="italic font-light text-amber-600">Never Compromise</span>
              </h2>
            </div>

            <div data-reveal-group className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((value) => (
                <div
                  key={value.title}
                  className="group rounded-2xl border border-zinc-200 bg-[#F7F4EC] p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-500/40 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)]"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/15 bg-amber-500/5 text-amber-700 transition-colors duration-300 group-hover:bg-amber-500/10">
                    {value.icon}
                  </div>
                  <h3 className="font-serif text-xl font-normal tracking-wide text-[#13294B] md:text-2xl">
                    {value.title}
                  </h3>
                  <p className="mt-3 font-body text-[0.85rem] leading-relaxed text-[#4A6285] md:text-sm">
                    {value.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- Craft split ---- */}
        <section className="w-full border-t border-zinc-200 px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Image */}
            <div data-reveal="left" className="relative h-[420px] overflow-hidden rounded-3xl md:h-[560px]">
              <div data-parallax="-0.08" className="absolute inset-0 scale-110">
                <Image
                  src="/artisan_crafting.png"
                  alt="A maison artisan setting a stone at the bench"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Copy */}
            <div data-reveal="right" className="space-y-6">
              <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-700">
                Inside the Workshop
              </span>
              <h2 className="font-serif text-4xl font-normal leading-[1.15] tracking-wide text-[#13294B] md:text-5xl">
                Cut by Hand,
                <br />
                <span className="italic font-light text-amber-600">Set by Eye</span>
              </h2>
              <p className="max-w-xl font-body text-sm leading-relaxed text-[#3A4E6B] md:text-base">
                No machine decides where a facet falls. Our cutters study each
                rough stone for days — sometimes weeks — before the first cut,
                because a sapphire only reveals its colour once and never
                forgives a hurried hand.
              </p>
              <ul className="space-y-4 border-t border-zinc-200 pt-6">
                {[
                  "Rough stones selected at the mine, never from parcels",
                  "One cutter per stone, start to finish, signed in the ledger",
                  "Settings finished under 10× magnification before release",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 flex-shrink-0 rotate-45 bg-amber-600" />
                    <span className="font-body text-[0.85rem] leading-relaxed text-[#4A6285] md:text-sm">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ---- Heritage timeline (dark band) ---- */}
        <section className="w-full border-t border-[#1D3D6B] bg-[#0D2347] px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div data-reveal className="mb-14 max-w-2xl md:mb-20">
              <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-gold-300">
                The House Journey
              </span>
              <h2 className="mt-4 font-serif text-4xl font-normal leading-[1.15] tracking-wide text-white md:text-5xl">
                From Export House
                <br />
                <span className="italic font-light text-gold-300">to Maison</span>
              </h2>
            </div>

            <ol data-reveal-group className="relative space-y-14 border-l border-gold-500/25 pl-8 md:space-y-16 md:pl-12">
              {TIMELINE.map((era) => (
                <li key={era.year} className="relative">
                  <span className="absolute -left-[37px] top-2.5 h-2.5 w-2.5 rounded-full bg-gold-400 shadow-[0_0_14px_rgba(46,91,224,0.8)] md:-left-[53px]" />
                  <p className="font-serif text-3xl font-light text-gold-300 md:text-4xl">
                    {era.year}
                  </p>
                  <h3 className="mt-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white md:text-[0.8rem]">
                    {era.title}
                  </h3>
                  <p className="mt-3 max-w-xl font-body text-[0.85rem] leading-relaxed text-[#C9D4E6] md:text-sm">
                    {era.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---- Closing invite ---- */}
        <section className="w-full border-t border-zinc-200 bg-[#F7F4EC] px-6 py-24 text-center md:px-12 md:py-32">
          <div data-reveal className="mx-auto max-w-2xl space-y-8">
            <span className="block font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-700">
              The Next Chapter
            </span>
            <h2 className="font-serif text-4xl font-normal leading-[1.15] tracking-wide text-[#13294B] md:text-5xl">
              Write Yours
              <br />
              <span className="italic font-light text-amber-600">With Us</span>
            </h2>
            <p className="mx-auto max-w-xl font-body text-sm leading-relaxed text-[#3A4E6B] md:text-base">
              Compose a commission in the digital atelier, or sit with our
              gemologist over a tray of loose Ceylon sapphires. Either way, the
              ledger is open.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
              <Link
                href="/atelier"
                className="w-full rounded-full bg-[#12305B] px-8 py-3.5 text-center font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#F7F4EC] transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-700 sm:w-auto"
              >
                Design in the Atelier
              </Link>
              <Link
                href="/contact"
                className="w-full rounded-full border border-zinc-300 px-8 py-3.5 text-center font-sans text-xs font-medium uppercase tracking-[0.2em] text-[#2C405C] transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-600 hover:text-amber-700 sm:w-auto"
              >
                Arrange a Private Visit
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
