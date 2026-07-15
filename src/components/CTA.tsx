import React from "react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="relative w-full bg-[#070708] py-32 md:py-44 px-6 md:px-12 z-20 select-none overflow-hidden border-t border-zinc-900">

      {/* Massive Ambient Radial Gold Glow behind the card */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(218,174,102,0.06)_0%,transparent_60%)] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gold-400/3 blur-[140px] pointer-events-none z-0" />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Glassmorphism Card */}
        <div data-reveal="zoom" className="glass-panel-glow rounded-[2rem] md:rounded-[3rem] p-8 sm:p-12 md:p-20 text-center relative overflow-hidden">
          
          {/* Subtle gold grid border background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          
          <div className="max-w-2xl mx-auto space-y-8 relative z-10">
            
            {/* Tagline */}
            <span className="text-[0.62rem] md:text-[0.68rem] tracking-[0.3em] uppercase text-gold-300 font-sans font-medium block">
              Bespoke Commissions
            </span>

            {/* Headline */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-wide text-white font-serif">
              Begin Your <br />
              <span className="italic text-gold-200 font-serif font-light">Bespoke Journey</span>
            </h2>

            {/* Subtext */}
            <p className="text-xs md:text-sm text-zinc-300 font-sans font-light leading-relaxed tracking-wide">
              Collaborate directly with our master designers to sculpt a piece of jewelry that embodies your heritage. From raw sketch to three-dimensional CAD render and hand-setting, we ensure every detail tells your story.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link
                href="/atelier"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gold-400 text-obsidian-950 text-xs tracking-[0.2em] font-sans font-semibold uppercase transition-all duration-300 hover:bg-gold-300 text-center shadow-[0_4px_25px_rgba(212,175,55,0.2)] hover:shadow-[0_4px_35px_rgba(212,175,55,0.45)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Design Your Ring Now
              </Link>
              <a
                href="mailto:atelier@aurajewelers.com?subject=Private%20Consultation%20Request"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-gold-400/25 text-gold-200 text-xs tracking-[0.2em] font-sans font-medium uppercase hover:bg-gold-500/10 hover:border-gold-300/50 transition-all duration-300 text-center backdrop-blur-sm hover:-translate-y-0.5 active:translate-y-0"
              >
                Book Private Consultation
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
