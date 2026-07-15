"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";

export default function FeaturedProducts() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const products = [
    {
      category: "Ring",
      name: "Celeste Diamond Ring",
      image: "/ring_celeste.png",
    },
    {
      category: "Necklace",
      name: "Celest Gold Charm",
      image: "/necklace_celest.png",
    },
    {
      category: "Earrings",
      name: "Aurea Diamond Drops",
      image: "/earring_aurea.png",
    },
    {
      category: "Bracelet",
      name: "Stellar Link Bracelet",
      image: "/bracelet_stellar.png",
    },
    {
      category: "Ring",
      name: "Eternal Bloom Ring",
      image: "/ring_eternal.png",
    },
    {
      category: "Earrings",
      name: "Golden Drop Earrings",
      image: "/earring_golden.png",
    },
    {
      category: "Bracelet",
      name: "Golden Aura Band",
      image: "/bracelet_aura.png",
    },
  ];

  // Autoplay functionality
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const firstCard = container.querySelector(".carousel-card");
        const cardWidth = firstCard ? firstCard.clientWidth : 340;
        const gap = 24; // gap-6
        const scrollAmount = cardWidth + gap;

        // Detect if at the scroll limit
        const isAtEnd =
          container.scrollLeft + container.clientWidth >=
          container.scrollWidth - 12; // tolerance buffer

        if (isAtEnd) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }
    }, 4000); // Slide every 4 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  const scrollPrev = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const firstCard = container.querySelector(".carousel-card");
      const cardWidth = firstCard ? firstCard.clientWidth : 340;
      const gap = 24; // gap-6
      container.scrollBy({ left: -(cardWidth + gap), behavior: "smooth" });
    }
  };

  const scrollNext = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const firstCard = container.querySelector(".carousel-card");
      const cardWidth = firstCard ? firstCard.clientWidth : 340;
      const gap = 24; // gap-6
      container.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
    }
  };

  return (
    <section 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full bg-[#070708] py-24 md:py-36 px-6 md:px-12 z-20 select-none border-t border-zinc-900"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Navigation Controls */}
        <div data-reveal className="flex items-center justify-between mb-10 md:mb-14">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-wide text-white font-serif">
            Featured product
          </h2>
          
          <div className="flex items-center gap-3">
            {/* Prev button */}
            <button
              onClick={scrollPrev}
              aria-label="Previous slide"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gold-400/20 flex items-center justify-center text-gold-300 hover:text-white hover:border-gold-300 hover:bg-gold-500/10 transition-all duration-300 active:scale-90 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Next button */}
            <button
              onClick={scrollNext}
              aria-label="Next slide"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-gold-400/20 flex items-center justify-center text-gold-300 hover:text-white hover:border-gold-300 hover:bg-gold-500/10 transition-all duration-300 active:scale-90 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Horizontal Carousel Track */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-6 px-1"
        >
          {products.map((product, idx) => (
            <div
              key={idx}
              data-tilt
              className="carousel-card group relative aspect-square bg-black flex flex-col justify-between p-6 overflow-hidden cursor-pointer w-[280px] sm:w-[320px] md:w-[360px] lg:w-[380px] flex-shrink-0 snap-start border border-zinc-900/80 hover:border-zinc-800 transition-colors duration-300"
            >
              {/* Category label */}
              <span className="text-[0.62rem] tracking-[0.25em] text-zinc-500 uppercase font-sans">
                {product.category}
              </span>

              {/* Product Image - Centered and scales smoothly on hover */}
              <div className="flex-1 flex items-center justify-center relative w-full h-full p-2 my-2 min-h-0">
                <div className="w-full h-full relative transition-transform duration-500 group-hover:scale-105">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-w-768px) 100vw, 33vw"
                    priority={idx < 3}
                    unoptimized
                  />
                </div>
              </div>

              {/* Footer row - product name & hover arrow */}
              <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
                <h4 className="text-sm tracking-wide text-white font-serif font-light transition-colors group-hover:text-gold-300">
                  {product.name}
                </h4>
                
                {/* Accent arrow icon */}
                <div className="text-zinc-500 transition-colors duration-300 group-hover:text-white pr-1 pb-1">
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M8 17l9-9m0 0H9m8 0v8" 
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
