import Image from "next/image";

export default function ProductGrid() {
  return (
    <section className="relative w-full bg-[#FAF9F6] py-24 md:py-36 z-20 select-none">
      
      {/* 3x3 Grid Wrapper with thin dividers */}
      <div data-reveal-group className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-zinc-900">
        
        {/* ROW 1: RINGS */}
        {/* Card 1: Ring Teaser Portrait */}
        <div className="group relative aspect-square bg-[#0c0c0d] flex flex-col justify-between overflow-hidden">
          {/* Portrait Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/ring_model.png"
              alt="Ring Category Model"
              fill
              className="object-cover transition-transform duration-[8000ms] group-hover:scale-105"
              sizes="(max-w-768px) 100vw, 33vw"
              unoptimized
            />
            {/* Soft dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/60 z-10" />
          </div>

          {/* Heading */}
          <div className="relative z-20 p-8">
            <h3 className="text-4xl md:text-5xl font-normal tracking-wide text-white font-serif">
              Ring
            </h3>
          </div>

          {/* View All Button */}
          <div className="relative z-20 p-8">
            <div className="inline-flex items-center gap-2 cursor-pointer group/btn">
              <div className="w-10 h-10 bg-white flex items-center justify-center transition-transform duration-300 group-hover/btn:translate-x-1">
                <svg
                  className="w-4 h-4 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
              <span className="px-5 py-2.5 text-[0.65rem] tracking-[0.25em] uppercase text-white bg-black/65 backdrop-blur-md border border-white/10 font-sans font-medium transition-colors hover:bg-black/80">
                View all
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Celeste Diamond Ring */}
        <div data-tilt className="group relative aspect-square bg-black flex flex-col justify-between p-6 overflow-hidden cursor-pointer">
          <span className="text-[0.62rem] tracking-[0.25em] text-zinc-500 uppercase font-sans">
            Ring
          </span>
          <div className="flex-1 flex items-center justify-center relative w-full h-full p-2 my-2 min-h-0">
            <div className="w-full h-full relative transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/ring_celeste.png"
                alt="Celeste Diamond Ring"
                fill
                className="object-contain"
                sizes="(max-w-768px) 100vw, 33vw"
                unoptimized
              />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
            <h4 className="text-sm tracking-wide text-white font-serif font-light transition-colors group-hover:text-gold-300">
              Celeste Diamond Ring
            </h4>
            <div className="text-zinc-500 transition-colors duration-300 group-hover:text-white pr-1 pb-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17l9-9m0 0H9m8 0v8" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Eternal Bloom Ring */}
        <div data-tilt className="group relative aspect-square bg-black flex flex-col justify-between p-6 overflow-hidden cursor-pointer">
          <span className="text-[0.62rem] tracking-[0.25em] text-zinc-500 uppercase font-sans">
            Ring
          </span>
          <div className="flex-1 flex items-center justify-center relative w-full h-full p-2 my-2 min-h-0">
            <div className="w-full h-full relative transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/ring_eternal.png"
                alt="Eternal Bloom Ring"
                fill
                className="object-contain"
                sizes="(max-w-768px) 100vw, 33vw"
                unoptimized
              />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
            <h4 className="text-sm tracking-wide text-white font-serif font-light transition-colors group-hover:text-gold-300">
              Eternal Bloom Ring
            </h4>
            <div className="text-zinc-500 transition-colors duration-300 group-hover:text-white pr-1 pb-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17l9-9m0 0H9m8 0v8" />
              </svg>
            </div>
          </div>
        </div>

        {/* ROW 2: EARRINGS */}
        {/* Card 1: Aurea Diamond Drops */}
        <div data-tilt className="group relative aspect-square bg-black flex flex-col justify-between p-6 overflow-hidden cursor-pointer">
          <span className="text-[0.62rem] tracking-[0.25em] text-zinc-500 uppercase font-sans">
            Earrings
          </span>
          <div className="flex-1 flex items-center justify-center relative w-full h-full p-2 my-2 min-h-0">
            <div className="w-full h-full relative transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/earring_aurea.png"
                alt="Aurea Diamond Drops"
                fill
                className="object-contain"
                sizes="(max-w-768px) 100vw, 33vw"
                unoptimized
              />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
            <h4 className="text-sm tracking-wide text-white font-serif font-light transition-colors group-hover:text-gold-300">
              Aurea Diamond Drops
            </h4>
            <div className="text-zinc-500 transition-colors duration-300 group-hover:text-white pr-1 pb-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17l9-9m0 0H9m8 0v8" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Golden Drop Earrings */}
        <div data-tilt className="group relative aspect-square bg-black flex flex-col justify-between p-6 overflow-hidden cursor-pointer">
          <span className="text-[0.62rem] tracking-[0.25em] text-zinc-500 uppercase font-sans">
            Earrings
          </span>
          <div className="flex-1 flex items-center justify-center relative w-full h-full p-2 my-2 min-h-0">
            <div className="w-full h-full relative transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/earring_golden.png"
                alt="Golden Drop Earrings"
                fill
                className="object-contain"
                sizes="(max-w-768px) 100vw, 33vw"
                unoptimized
              />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
            <h4 className="text-sm tracking-wide text-white font-serif font-light transition-colors group-hover:text-gold-300">
              Golden Drop Earrings
            </h4>
            <div className="text-zinc-500 transition-colors duration-300 group-hover:text-white pr-1 pb-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17l9-9m0 0H9m8 0v8" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Earrings Teaser Portrait (Aligned right in Row 2) */}
        <div className="group relative aspect-square bg-[#0c0c0d] flex flex-col justify-between overflow-hidden">
          {/* Portrait Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/earring_model.png"
              alt="Earrings Category Model"
              fill
              className="object-cover transition-transform duration-[8000ms] group-hover:scale-105"
              sizes="(max-w-768px) 100vw, 33vw"
              unoptimized
            />
            {/* Soft dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/60 z-10" />
          </div>

          {/* Heading */}
          <div className="relative z-20 p-8">
            <h3 className="text-4xl md:text-5xl font-normal tracking-wide text-white font-serif">
              Earrings
            </h3>
          </div>

          {/* View All Button */}
          <div className="relative z-20 p-8">
            <div className="inline-flex items-center gap-2 cursor-pointer group/btn">
              <div className="w-10 h-10 bg-white flex items-center justify-center transition-transform duration-300 group-hover/btn:translate-x-1">
                <svg
                  className="w-4 h-4 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
              <span className="px-5 py-2.5 text-[0.65rem] tracking-[0.25em] uppercase text-white bg-black/65 backdrop-blur-md border border-white/10 font-sans font-medium transition-colors hover:bg-black/80">
                View all
              </span>
            </div>
          </div>
        </div>

        {/* ROW 3: BRACELETS */}
        {/* Card 1: Bracelet Teaser Portrait */}
        <div className="group relative aspect-square bg-[#0c0c0d] flex flex-col justify-between overflow-hidden">
          {/* Portrait Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/bracelet_model.png"
              alt="Bracelet Category Model"
              fill
              className="object-cover transition-transform duration-[8000ms] group-hover:scale-105"
              sizes="(max-w-768px) 100vw, 33vw"
              unoptimized
            />
            {/* Soft dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/60 z-10" />
          </div>

          {/* Heading */}
          <div className="relative z-20 p-8">
            <h3 className="text-4xl md:text-5xl font-normal tracking-wide text-white font-serif">
              Bracelet
            </h3>
          </div>

          {/* View All Button */}
          <div className="relative z-20 p-8">
            <div className="inline-flex items-center gap-2 cursor-pointer group/btn">
              <div className="w-10 h-10 bg-white flex items-center justify-center transition-transform duration-300 group-hover/btn:translate-x-1">
                <svg
                  className="w-4 h-4 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
              <span className="px-5 py-2.5 text-[0.65rem] tracking-[0.25em] uppercase text-white bg-black/65 backdrop-blur-md border border-white/10 font-sans font-medium transition-colors hover:bg-black/80">
                View all
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Stellar Link Bracelet */}
        <div data-tilt className="group relative aspect-square bg-black flex flex-col justify-between p-6 overflow-hidden cursor-pointer">
          <span className="text-[0.62rem] tracking-[0.25em] text-zinc-500 uppercase font-sans">
            Bracelet
          </span>
          <div className="flex-1 flex items-center justify-center relative w-full h-full p-2 my-2 min-h-0">
            <div className="w-full h-full relative transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/bracelet_stellar.png"
                alt="Stellar Link Bracelet"
                fill
                className="object-contain"
                sizes="(max-w-768px) 100vw, 33vw"
                unoptimized
              />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
            <h4 className="text-sm tracking-wide text-white font-serif font-light transition-colors group-hover:text-gold-300">
              Stellar Link Bracelet
            </h4>
            <div className="text-zinc-500 transition-colors duration-300 group-hover:text-white pr-1 pb-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17l9-9m0 0H9m8 0v8" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Golden Aura Band */}
        <div data-tilt className="group relative aspect-square bg-black flex flex-col justify-between p-6 overflow-hidden cursor-pointer">
          <span className="text-[0.62rem] tracking-[0.25em] text-zinc-500 uppercase font-sans">
            Bracelet
          </span>
          <div className="flex-1 flex items-center justify-center relative w-full h-full p-2 my-2 min-h-0">
            <div className="w-full h-full relative transition-transform duration-500 group-hover:scale-105">
              <Image
                src="/bracelet_aura.png"
                alt="Golden Aura Band"
                fill
                className="object-contain"
                sizes="(max-w-768px) 100vw, 33vw"
                unoptimized
              />
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
            <h4 className="text-sm tracking-wide text-white font-serif font-light transition-colors group-hover:text-gold-300">
              Golden Aura Band
            </h4>
            <div className="text-zinc-500 transition-colors duration-300 group-hover:text-white pr-1 pb-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 17l9-9m0 0H9m8 0v8" />
              </svg>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
}
