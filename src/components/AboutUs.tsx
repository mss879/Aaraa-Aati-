import Image from "next/image";
import Ring3D from "@/components/Ring3D";

export default function AboutUs() {
  return (
    <section className="relative w-full min-h-[85vh] md:h-[80vh] flex flex-col md:flex-row items-stretch bg-[#FAF9F6] z-20 select-none">
      
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
            Our Atelier & Heritage
          </span>
        </div>

        {/* Heading */}
        <h2 data-reveal className="text-3xl md:text-5xl font-normal leading-[1.15] tracking-wide text-zinc-900 font-serif">
          A Legacy of <br />
          <span className="italic text-amber-600 font-serif font-light">Pure Craftsmanship</span>
        </h2>

        {/* Body Text */}
        <p data-reveal className="text-sm md:text-base text-zinc-700 font-sans leading-relaxed max-w-xl">
          At Ceylon Gem Maison, we believe that jewelry is more than an adornment—it is a vessel for memories, legacy, and human emotion. For nearly a century, our workshop has been dedicated to hand-selecting the world's finest ethically sourced diamonds and carving them into timeless masterpieces.
        </p>

        {/* Brand Values List */}
        <div data-reveal-group className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-200">
          <div className="space-y-1.5">
            <h4 className="text-xs md:text-[0.8rem] font-semibold tracking-[0.15em] text-amber-700 uppercase font-sans">
              100% Ethical Sourcing
            </h4>
            <p className="text-[0.82rem] md:text-sm text-zinc-600 font-sans leading-relaxed">
              Every gemstone and gold grain is fully traceable, protecting environmental and social rights.
            </p>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-xs md:text-[0.8rem] font-semibold tracking-[0.15em] text-amber-700 uppercase font-sans">
              Lifetime Atelier Warranty
            </h4>
            <p className="text-[0.82rem] md:text-sm text-zinc-600 font-sans leading-relaxed">
              Designed to endure for generations. Backed by our lifetime structural and gem-setting warranty.
            </p>
          </div>
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
            alt="Artisan Crafting"
            fill
            sizes="(max-w-768px) 100vw, 45vw"
            className="object-cover"
            priority
            unoptimized
          />
        </div>
        
        {/* Gradients to blend image edges into the white background */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#FAF9F6] via-transparent to-transparent z-10 w-full md:w-[15%]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/35 z-10" />
      </div>

    </section>
  );
}
