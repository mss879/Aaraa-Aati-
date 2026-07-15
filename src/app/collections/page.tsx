import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import CollectionGallery from "@/components/CollectionGallery";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ScrollFX from "@/components/fx/ScrollFX";
import LuxeCursor from "@/components/fx/LuxeCursor";

export const metadata: Metadata = {
  title: "The Collections",
  description:
    "Rings, necklaces, earrings and bracelets from the Ceylon Gem Maison ateliers — hand-cut Ceylon stones in 18k gold, each piece signed in the house ledger.",
};

const CRAFT_MARKS = [
  {
    title: "Hand-Cut Stones",
    body: "Every gem is cut in-house by one master cutter, start to finish.",
  },
  {
    title: "Signed & Certified",
    body: "Each piece leaves with papers, a ledger entry, and the cutter's mark.",
  },
  {
    title: "Made to Endure",
    body: "Structural work is guaranteed for life — built to be inherited.",
  },
];

export default function CollectionsPage() {
  return (
    <main className="relative flex min-h-screen w-full select-none flex-col bg-[#070708] p-[10px]">
      <ScrollFX />
      <LuxeCursor />

      <PageHero
        eyebrow="The Maison Collections"
        title="Objects of"
        titleAccent="Quiet Splendour"
        body="A small, deliberate body of work: rings, necklaces, earrings and bracelets in hand-cut Ceylon stones and 18k gold. Nothing mass-made, nothing repeated."
        image={{ src: "/earring_model.png", position: "center 22%" }}
      />

      {/* White island */}
      <div className="relative z-20 mt-[10px] flex w-full flex-col overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-[#FAF9F6] shadow-[0_-20px_50px_rgba(0,0,0,0.35)] md:rounded-[3rem]">

        {/* Filterable gallery (reads ?f= → needs Suspense for useSearchParams) */}
        <Suspense fallback={null}>
          <CollectionGallery />
        </Suspense>

        {/* ---- Craft assurances ---- */}
        <section className="w-full bg-white px-6 py-20 md:px-12 md:py-28">
          <div data-reveal-group className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3 md:gap-8">
            {CRAFT_MARKS.map((mark, idx) => (
              <div key={mark.title} className="flex items-start gap-5">
                <span className="font-serif text-4xl font-light text-amber-600/60 md:text-5xl">
                  0{idx + 1}
                </span>
                <div className="pt-1.5">
                  <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-zinc-900 md:text-[0.8rem]">
                    {mark.title}
                  </h3>
                  <p className="mt-2 max-w-xs font-sans text-[0.85rem] leading-relaxed text-zinc-600 md:text-sm">
                    {mark.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---- Editorial interlude ---- */}
        <section className="relative w-full overflow-hidden border-y border-zinc-900 bg-[#0c0c0d]">
          <div className="relative mx-auto grid min-h-[420px] max-w-none md:grid-cols-2">
            <div data-reveal className="relative z-20 flex flex-col justify-center px-6 py-20 md:px-16 md:py-28">
              <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-gold-300">
                Worn, Not Displayed
              </span>
              <h2 className="mt-4 max-w-md font-serif text-4xl font-normal leading-[1.15] tracking-wide text-white md:text-5xl">
                Jewelry Meant for
                <span className="italic font-light text-gold-300"> a Life</span>
              </h2>
              <p className="mt-6 max-w-md font-sans text-sm leading-relaxed text-zinc-300 md:text-base">
                These pieces are photographed on black velvet, but they are made
                for warm skin, long evenings, and hands that talk. If a piece
                speaks to you, ask to see it move in the light.
              </p>
            </div>
            <div className="relative min-h-[320px] md:min-h-full">
              <div data-parallax="-0.08" className="absolute inset-0 scale-110">
                <Image
                  src="/ring_model.png"
                  alt="A maison ring worn on the hand"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0d] via-transparent to-transparent" />
            </div>
          </div>
        </section>

        {/* Bespoke banner (shared with home) */}
        <CTA />

        <Footer />
      </div>
    </main>
  );
}
