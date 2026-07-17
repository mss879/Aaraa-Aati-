import Image from "next/image";
import Link from "next/link";
import Ring3D from "@/components/Ring3D";

/**
 * AboutUs — homepage preview only. The full story lives at /about; this band
 * carries one paragraph, two proof points and a single button.
 */
export default function AboutUs() {
  return (
    <section className="relative w-full min-h-[85vh] md:h-[80vh] flex flex-col md:flex-row items-stretch bg-[#F7F4EC] z-20 select-none">

      {/* Left side: Copy & Values */}
      <div className="w-full md:w-[55%] p-10 md:p-20 flex flex-col justify-center space-y-6 md:space-y-8 relative z-20">

        {/* 3D Spinning Ring - Top Right of Content Area */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 w-32 h-32 md:w-56 md:h-56 z-10 pointer-events-none md:pointer-events-auto">
          <Ring3D />
        </div>

        {/* Tagline */}
        <div data-reveal className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 self-start">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[0.7rem] tracking-[0.3em] uppercase text-amber-700 font-sans font-medium">
            Our Atelier &amp; Heritage
          </span>
        </div>

        {/* Heading */}
        <h2 data-reveal className="text-3xl md:text-5xl font-normal leading-[1.15] tracking-wide text-[#13294B] font-serif">
          From Ceylon&apos;s Earth, <br />
          <span className="italic text-amber-600 font-serif font-light">To Life&apos;s Great Moments</span>
        </h2>

        {/* Body Text */}
        <p data-reveal className="text-sm md:text-base text-[#3A4E6B] font-body leading-relaxed max-w-xl">
          Ceylon Gem Maison carries years of professional experience exporting
          world-class, ethically sourced gemstones to the West. Today that same
          acumen is devoted to one thing: sapphires — intricately tailored into
          wedding and engagement rings for those who wish to treasure their
          life-changing moments.
        </p>

        {/* Brand Values List */}
        <div data-reveal-group className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-200">
          <h4 className="text-xs md:text-[0.8rem] font-semibold tracking-[0.15em] text-amber-700 uppercase font-sans">
            100% Ethical Sourcing
          </h4>
          <h4 className="text-xs md:text-[0.8rem] font-semibold tracking-[0.15em] text-amber-700 uppercase font-sans">
            International Standards
          </h4>
        </div>

        {/* Story CTA — satin pill + arrow orb */}
        <div data-reveal className="pt-2">
          <Link href="/about" className="group inline-flex items-center gap-3">
            <span className="btn-luxe-pill px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.2em]">
              Discover Our Story
            </span>
            <span className="btn-luxe-orb h-12 w-12">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7m0 0H9m8 0v8" />
              </svg>
            </span>
          </Link>
        </div>

      </div>

      {/* Desktop Vertical Divider */}
      <div className="hidden md:block w-[1px] bg-gradient-to-b from-transparent via-zinc-200 to-transparent relative z-25" />

      {/* Right side: Image showcase */}
      <div className="w-full md:w-[45%] relative min-h-[40vh] md:min-h-full overflow-hidden">
        {/* Background Image (slightly oversized so the parallax drift never exposes edges) */}
        <div data-parallax="-0.08" className="absolute inset-0 scale-110">
          <Image
            src="/artisan_crafting.png"
            alt="Ceylon Gem Maison artisan crafting a bespoke ring at the bench"
            fill
            sizes="(max-w-768px) 100vw, 45vw"
            className="object-cover"
            priority
            unoptimized
          />
        </div>

        {/* Gradients to blend image edges into the white background */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#F7F4EC] via-transparent to-transparent z-10 w-full md:w-[15%]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/35 z-10" />
      </div>

    </section>
  );
}
