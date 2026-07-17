"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, PIECES, type Category } from "@/lib/collections";

type Filter = Category | "All";

/** Map a ?f= query value (e.g. "rings") onto a gallery filter. */
function filterFromParam(param: string | null): Filter {
  if (!param) return "All";
  const match = CATEGORIES.find((c) => c.toLowerCase() === param.toLowerCase());
  return match ?? "All";
}

/**
 * CollectionGallery
 * Filterable gallery of the maison's pieces. Cards reuse the home page's
 * black-card grid language; each piece links to the contact page with the
 * enquiry pre-filled. Arrive with ?f=rings|necklaces|earrings|bracelets to
 * open on a category (used by the footer links).
 */
export default function CollectionGallery() {
  const initial = filterFromParam(useSearchParams().get("f"));
  const [active, setActive] = useState<Filter>(initial);

  const shown =
    active === "All" ? PIECES : PIECES.filter((p) => p.category === active);

  return (
    <section className="w-full">
      {/* Filter bar */}
      <div className="px-6 pb-12 pt-24 md:px-12 md:pb-16 md:pt-32">
        {/* NOTE: no data-reveal / data-tilt in here — this island hydrates late
            (Suspense + useSearchParams), and ScrollFX's pre-hydration style
            writes would trigger React hydration mismatches. */}
        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-700">
              The Maison Collections
            </span>
            <h2 className="mt-4 font-serif text-4xl font-normal leading-[1.15] tracking-wide text-[#13294B] md:text-5xl">
              Browse the
              <span className="italic font-light text-amber-600"> House</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {(["All", ...CATEGORIES] as Filter[]).map((filter) => {
              const isActive = filter === active;
              return (
                <button
                  key={filter}
                  onClick={() => setActive(filter)}
                  aria-pressed={isActive}
                  className={`cursor-pointer rounded-full border px-5 py-2 font-sans text-[0.7rem] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${
                    isActive
                      ? "border-[#1D3D6B] bg-[#12305B] text-[#F7F4EC]"
                      : "border-zinc-300 text-[#4A6285] hover:border-[#1D3D6B] hover:text-[#13294B]"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-7xl font-sans text-[0.7rem] uppercase tracking-[0.25em] text-[#5E7495]">
          {shown.length} {shown.length === 1 ? "piece" : "pieces"}
          {active !== "All" && ` · ${active}`}
        </p>
      </div>

      {/* Gallery grid — the home page's black-card language, full bleed */}
      <div className="grid grid-cols-1 gap-[1px] border-y border-[#1D3D6B] bg-[#12305B] sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((piece) => (
          <div
            key={piece.slug}
            className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden bg-black p-6 md:p-7"
          >
            {/* Category label */}
            <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.25em] text-[#A9B8D0]">
              {piece.category}
            </span>

            {/* Image */}
            <div className="relative my-3 min-h-0 w-full flex-1">
              <div className="relative h-full w-full transition-transform duration-500 group-hover:scale-105">
                <Image
                  src={piece.image}
                  alt={piece.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div>
                <h3 className="font-serif text-lg tracking-wide text-white transition-colors group-hover:text-gold-300 md:text-xl">
                  {piece.name}
                </h3>
                <p className="mt-1 font-sans text-[0.72rem] uppercase tracking-[0.15em] text-[#5E7495]">
                  {piece.notes}
                </p>
              </div>
              <p className="font-body text-[0.82rem] leading-relaxed text-[#A9B8D0] md:text-sm">
                {piece.description}
              </p>
              <div className="flex items-center justify-between border-t border-[#1D3D6B] pt-4">
                <span className="font-sans text-[0.7rem] uppercase tracking-[0.2em] text-gold-300/90">
                  Price upon request
                </span>
                <Link
                  href={`/contact?piece=${encodeURIComponent(piece.name)}`}
                  className="inline-flex items-center gap-2 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#A9B8D0] transition-colors hover:text-white"
                  aria-label={`Enquire about the ${piece.name}`}
                >
                  Enquire
                  <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l9-9m0 0H9m8 0v8" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
