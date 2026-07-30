import React from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * CTA — "Begin Your Bespoke Journey" band.
 * Full-width navy silk section, editorial split: display headline on the
 * left, the invitation copy and CTA pair on the right, divided by a
 * diamond-tipped hairline. Typography and ornament only — no imagery.
 */
export default function CTA() {
  return (
    <section className="silk-navy relative z-20 w-full select-none overflow-hidden px-6 py-28 md:px-12 md:py-40">

      {/* The maison's silk-and-loose-stones ground. object-bottom on purpose: the
          artwork puts its gemstone row along the bottom edge and leaves plain silk
          above it, and this band is far wider than the 2:1 art, so cover crops
          vertically — anchoring to the bottom keeps the stones and spends the crop
          on empty silk. .silk-navy stays on the section underneath as the loading
          colour, so the band never flashes pale before the art arrives. */}
      <Image
        src="/bespoke.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-bottom"
      />

      {/* Scrim. The silk carries broad highlights and the stones are bright, so
          the type needs a floor under it — weighted to the top, where the copy
          sits, and lifting toward the bottom so the stones still read. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#061027]/75 via-[#061027]/55 to-[#061027]/25"
      />

      {/* Sapphire hairline along the top edge */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-56 bg-gradient-to-r from-transparent via-gold-300 to-transparent" />

      <div data-reveal className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.3fr_auto_1fr] lg:gap-16">

        {/* Headline */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-gold-300/40" />
            <span className="h-2 w-2 rotate-45 border border-gold-300/70 bg-gold-300/20" />
            <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-gold-200">
              Bespoke Commissions
            </span>
          </div>

          <h2 className="font-serif text-4xl font-normal leading-[1.1] tracking-wide text-[#F7F4EC] md:text-5xl">
            Begin Your <br />
            <span className="italic font-light text-gold-300">Bespoke Journey</span>
          </h2>
        </div>

        {/* Diamond-tipped vertical hairline */}
        <div className="hidden h-full min-h-[16rem] flex-col items-center lg:flex" aria-hidden="true">
          <span className="h-2 w-2 flex-none rotate-45 border border-gold-300/70 bg-gold-300/20" />
          <span className="w-px flex-1 bg-gradient-to-b from-gold-300/50 via-white/10 to-transparent" />
        </div>

        {/* Copy + actions */}
        <div className="space-y-8">
          <p className="font-body text-sm leading-relaxed text-[#C6D3E8] md:text-base">
            Collaborate directly with our master designers to sculpt a piece of
            jewelry that embodies your heritage. From raw sketch to
            three-dimensional CAD render and hand-setting, we ensure every
            detail tells your story.
          </p>

          <div className="flex flex-col items-start gap-4">
            <Link href="/atelier" className="group inline-flex w-full items-center justify-center gap-3 sm:w-auto sm:justify-start">
              <span className="btn-luxe-pill w-full sm:w-auto">
                Design Your Piece Now
              </span>
              <span className="btn-luxe-orb btn-luxe-orb--light hidden h-12 w-12 sm:inline-flex">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7m0 0H9m8 0v8" />
                </svg>
              </span>
            </Link>
            <a
              href="mailto:support@ceylongemmaison.com?subject=Private%20Consultation%20Request"
 className="w-full btn-platinum sm:w-auto"
            >
              Book Private Consultation
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
