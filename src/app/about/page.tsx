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
    "Nearly a century of Sri Lankan gem heritage: from a Ratnapura cutting workshop in 1928 to a bespoke Colombo atelier serving private clients worldwide.",
};

const STATS = [
  { value: "1928", label: "House Founded" },
  { value: "3", label: "Generations of Cutters" },
  { value: "100%", label: "Traceable Stones" },
  { value: "1,400+", label: "Bespoke Commissions" },
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
    year: "1928",
    title: "The Ratnapura Workshop",
    body: "Master cutter Don Bastian opens a two-bench workshop in the City of Gems, cutting sapphires for the great European houses.",
  },
  {
    year: "1962",
    title: "The Colombo Atelier",
    body: "The second generation opens the maison's first private salon on Galle Face, setting the house's own designs for the first time.",
  },
  {
    year: "1998",
    title: "A Global Clientele",
    body: "The third generation carries the ledger abroad — private commissions for collectors across four continents, all still cut at home.",
  },
  {
    year: "2026",
    title: "The Digital Atelier",
    body: "Bespoke goes live: clients compose their own commission in a real-time 3D atelier, rendered by AI and finished by the same hands as always.",
  },
];

export default function AboutPage() {
  return (
    <main className="relative flex min-h-screen w-full select-none flex-col bg-[#070708] p-[10px]">
      <ScrollFX />
      <LuxeCursor />

      <PageHero
        eyebrow="Since 1928 · Ratnapura & Colombo"
        title="The Maison"
        titleAccent="Behind the Stone"
        body="Three generations of Sri Lankan gem cutters, one unbroken ledger of commissions — this is the house that treats jewelry as memory made permanent."
        image={{ src: "/artisan_crafting.png", position: "center 30%" }}
      />

      {/* White island */}
      <div className="relative z-20 mt-[10px] flex w-full flex-col overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-[#FAF9F6] shadow-[0_-20px_50px_rgba(0,0,0,0.35)] md:rounded-[3rem]">

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
              <p className="font-serif text-3xl font-light leading-[1.25] text-zinc-900 md:text-4xl lg:text-[2.75rem]">
                &ldquo;A gem is not cut.
                <br />
                <span className="italic text-amber-600">It is listened to.</span>&rdquo;
              </p>
              <p className="mt-6 font-sans text-xs uppercase tracking-[0.25em] text-zinc-500">
                — Don Bastian, Founder
              </p>
            </div>

            <div data-reveal className="flex flex-col justify-center space-y-6">
              <p className="max-w-2xl font-sans text-sm leading-relaxed text-zinc-700 md:text-base">
                Ceylon Gem Maison began in 1928 as a two-bench cutting workshop in
                Ratnapura — the City of Gems — where our founder learned to read
                the grain of a sapphire the way others read a page. The great
                European houses bought his stones; his family kept his ledger.
              </p>
              <p className="max-w-2xl font-sans text-sm leading-relaxed text-zinc-700 md:text-base">
                Nearly a century later, that ledger is still open. The maison now
                spans a private Colombo salon, a working atelier, and clients on
                four continents — yet every stone we set is still bought at
                source, cut by hand, and signed by the cutter who shaped it.
              </p>
              <p className="max-w-2xl font-sans text-sm leading-relaxed text-zinc-700 md:text-base">
                We remain deliberately small. A handful of commissions leave the
                house each month, each one built to be worn for a lifetime and
                then inherited.
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div data-reveal-group className="mx-auto mt-20 grid max-w-7xl grid-cols-2 gap-y-10 border-t border-zinc-200 pt-12 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <p className="font-serif text-4xl font-light text-zinc-900 md:text-5xl">
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
        <section id="values" className="w-full scroll-mt-6 border-t border-zinc-200 bg-white px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div data-reveal className="mb-14 max-w-2xl md:mb-20">
              <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-700">
                The House Pledge
              </span>
              <h2 className="mt-4 font-serif text-4xl font-normal leading-[1.15] tracking-wide text-zinc-900 md:text-5xl">
                What We Will
                <br />
                <span className="italic font-light text-amber-600">Never Compromise</span>
              </h2>
            </div>

            <div data-reveal-group className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((value) => (
                <div
                  key={value.title}
                  className="group rounded-2xl border border-zinc-200 bg-[#FAF9F6] p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-500/40 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)]"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-amber-500/15 bg-amber-500/5 text-amber-700 transition-colors duration-300 group-hover:bg-amber-500/10">
                    {value.icon}
                  </div>
                  <h3 className="font-serif text-xl font-normal tracking-wide text-zinc-900 md:text-2xl">
                    {value.title}
                  </h3>
                  <p className="mt-3 font-sans text-[0.85rem] leading-relaxed text-zinc-600 md:text-sm">
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
              <h2 className="font-serif text-4xl font-normal leading-[1.15] tracking-wide text-zinc-900 md:text-5xl">
                Cut by Hand,
                <br />
                <span className="italic font-light text-amber-600">Set by Eye</span>
              </h2>
              <p className="max-w-xl font-sans text-sm leading-relaxed text-zinc-700 md:text-base">
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
                    <span className="font-sans text-[0.85rem] leading-relaxed text-zinc-600 md:text-sm">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ---- Heritage timeline (dark band) ---- */}
        <section className="w-full border-t border-zinc-900 bg-[#0b0b0c] px-6 py-24 md:px-12 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div data-reveal className="mb-14 max-w-2xl md:mb-20">
              <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-gold-300">
                The House Timeline
              </span>
              <h2 className="mt-4 font-serif text-4xl font-normal leading-[1.15] tracking-wide text-white md:text-5xl">
                A Century
                <br />
                <span className="italic font-light text-gold-300">in the Making</span>
              </h2>
            </div>

            <ol data-reveal-group className="relative space-y-14 border-l border-gold-500/25 pl-8 md:space-y-16 md:pl-12">
              {TIMELINE.map((era) => (
                <li key={era.year} className="relative">
                  <span className="absolute -left-[37px] top-2.5 h-2.5 w-2.5 rounded-full bg-gold-400 shadow-[0_0_14px_rgba(219,174,102,0.8)] md:-left-[53px]" />
                  <p className="font-serif text-3xl font-light text-gold-300 md:text-4xl">
                    {era.year}
                  </p>
                  <h3 className="mt-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-white md:text-[0.8rem]">
                    {era.title}
                  </h3>
                  <p className="mt-3 max-w-xl font-sans text-[0.85rem] leading-relaxed text-zinc-300 md:text-sm">
                    {era.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---- Closing invite ---- */}
        <section className="w-full border-t border-zinc-200 bg-white px-6 py-24 text-center md:px-12 md:py-32">
          <div data-reveal className="mx-auto max-w-2xl space-y-8">
            <span className="block font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-700">
              The Next Chapter
            </span>
            <h2 className="font-serif text-4xl font-normal leading-[1.15] tracking-wide text-zinc-900 md:text-5xl">
              Write Yours
              <br />
              <span className="italic font-light text-amber-600">With Us</span>
            </h2>
            <p className="mx-auto max-w-xl font-sans text-sm leading-relaxed text-zinc-700 md:text-base">
              Compose a commission in the digital atelier, or sit with our
              gemologist over a tray of loose Ceylon sapphires. Either way, the
              ledger is open.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
              <Link
                href="/atelier"
                className="w-full rounded-full bg-zinc-900 px-8 py-3.5 text-center font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#FAF9F6] transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-700 sm:w-auto"
              >
                Design in the Atelier
              </Link>
              <Link
                href="/contact"
                className="w-full rounded-full border border-zinc-300 px-8 py-3.5 text-center font-sans text-xs font-medium uppercase tracking-[0.2em] text-zinc-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-600 hover:text-amber-700 sm:w-auto"
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
