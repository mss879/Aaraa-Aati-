import Image from "next/image";
import Link from "next/link";

/**
 * ProductGrid — "New Jewellery Collections" band.
 * A deep-navy silk section: reference-style header (serif + italic accent,
 * underlined View Collection link with arrow orb) above the original
 * full-width 3×3 bento, cells flush and divided by hairlines. Category teaser
 * portraits carry pill + arrow-orb CTAs; signature pieces carry ivory chips,
 * serif names and "+" orbs.
 */

type Piece = {
  name: string;
  category: string;
  image: string;
};

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7m0 0H9m8 0v8" />
    </svg>
  );
}

function TeaserCard({
  title,
  image,
  href,
}: {
  title: string;
  image: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex aspect-square flex-col justify-between overflow-hidden bg-[#0D2347]"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={image}
          alt={`${title} category model`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/45 via-transparent to-black/65" />
      </div>

      <div className="relative z-20 p-7 md:p-8">
        <h3 className="font-serif text-4xl font-normal tracking-wide text-white md:text-5xl">
          {title}
        </h3>
      </div>

      <div className="relative z-20 flex items-center gap-3 p-7 md:p-8">
        <span className="btn-luxe-pill px-7 py-3 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.25em]">
          View All
        </span>
        <span className="btn-luxe-orb btn-luxe-orb--light h-11 w-11">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function ProductCard({ piece }: { piece: Piece }) {
  return (
    <div className="group relative aspect-square cursor-pointer overflow-hidden bg-[#081525]">
      <Image
        src={piece.image}
        alt={piece.name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/75" />

      <span className="chip-luxe absolute left-6 top-6 z-20">{piece.category}</span>

      <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 p-6 md:p-7">
        <h4 className="font-serif text-lg tracking-wide text-white transition-colors duration-300 group-hover:text-gold-200 md:text-xl">
          {piece.name}
        </h4>
        <span className="btn-luxe-orb btn-luxe-orb--light h-10 w-10">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v14m7-7H5" />
          </svg>
        </span>
      </div>
    </div>
  );
}

export default function ProductGrid() {
  return (
    <section className="silk-navy relative z-20 w-full select-none overflow-hidden pt-24 md:pt-32">
      {/* Header — flush with the grid's left edge */}
      <div className="w-full px-6 md:px-12">
        <div
          data-reveal
          className="mb-12 flex flex-col items-start justify-between gap-8 md:mb-16 md:flex-row md:items-end"
        >
          <div>
            {/* Ornament */}
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-gold-300/40" />
              <span className="h-2 w-2 rotate-45 border border-gold-300/70 bg-gold-300/20" />
              <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-gold-200">
                Signature Pieces
              </span>
            </div>
            <h2 className="font-serif text-4xl font-normal leading-[1.15] tracking-wide text-[#F7F4EC] md:text-5xl">
              New Jewellery
              <br />
              <span className="italic font-light text-gold-300">Collections</span>
            </h2>
          </div>

          <Link href="/collections" className="group flex items-center gap-4">
            <span className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-[#F7F4EC] underline decoration-gold-300/60 decoration-[1px] underline-offset-[10px] transition-colors duration-300 group-hover:text-gold-200">
              View Collection
            </span>
            <span className="btn-luxe-orb btn-luxe-orb--light h-11 w-11">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>

      {/* Full-width 3×3 bento, cells flush with hairline dividers */}
      <div data-reveal-group className="grid grid-cols-1 gap-[1px] border-t border-[#1D3D6B] bg-[#1D3D6B] md:grid-cols-3">
        {/* Row 1 — Rings */}
        <TeaserCard title="Ring" image="/ring_model.png" href="/collections?f=rings" />
        <ProductCard piece={{ name: "Celeste Diamond Ring", category: "Ring", image: "/ring_celeste.png" }} />
        <ProductCard piece={{ name: "Eternal Bloom Ring", category: "Ring", image: "/ring_eternal.png" }} />

        {/* Row 2 — Earrings */}
        <ProductCard piece={{ name: "Aurea Diamond Drops", category: "Earrings", image: "/earring_aurea.png" }} />
        <ProductCard piece={{ name: "Golden Drop Earrings", category: "Earrings", image: "/earring_golden.png" }} />
        <TeaserCard title="Earrings" image="/earring_model.png" href="/collections?f=earrings" />

        {/* Row 3 — Bracelets */}
        <TeaserCard title="Bracelet" image="/bracelet_model.png" href="/collections?f=bracelets" />
        <ProductCard piece={{ name: "Stellar Link Bracelet", category: "Bracelet", image: "/bracelet_stellar.png" }} />
        <ProductCard piece={{ name: "Golden Maison Band", category: "Bracelet", image: "/bracelet_aura.png" }} />
      </div>
    </section>
  );
}
