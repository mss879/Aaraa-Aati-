"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

/**
 * OurWork
 * A two-row film-strip of real client commissions. The rows drift in opposite
 * directions on an infinite CSS marquee (each track's content is rendered
 * twice and translated by -50%). Videos are muted loops that only play while
 * the section is on screen; everything pauses on hover and collapses to a
 * swipeable strip for prefers-reduced-motion users.
 */

type WorkItem = {
  type: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  aspect: "landscape" | "portrait" | "square" | "reel";
};

const ROW_A: WorkItem[] = [
  {
    type: "image",
    src: "/our-work/our-work-03.webp",
    alt: "Rose gold medallion pendant with pavé diamond starfish, handcrafted by Ceylon Gem Maison",
    aspect: "landscape",
  },
  {
    type: "video",
    src: "/our-work/reel-03.mp4",
    poster: "/our-work/reel-03-poster.webp",
    alt: "Film of an emerald cocktail ring with double diamond halo",
    aspect: "reel",
  },
  {
    type: "image",
    src: "/our-work/our-work-04.webp",
    alt: "Cushion-cut Ceylon blue sapphire ring with diamond frame in its presentation box",
    aspect: "portrait",
  },
  {
    type: "image",
    src: "/our-work/our-work-01.webp",
    alt: "Rose gold pavé diamond starfish stud earrings in a wooden presentation box",
    aspect: "landscape",
  },
  {
    type: "image",
    src: "/our-work/our-work-06.webp",
    alt: "Matched suite of oval Ceylon blue sapphire and diamond cluster earrings and ring",
    aspect: "landscape",
  },
];

const ROW_B: WorkItem[] = [
  {
    type: "video",
    src: "/our-work/reel-01.mp4",
    poster: "/our-work/reel-01-poster.webp",
    alt: "Film of a rose gold pavé diamond pendant turned by hand in the atelier",
    aspect: "reel",
  },
  {
    type: "image",
    src: "/our-work/our-work-07.webp",
    alt: "Three-stone royal blue sapphire and diamond ring in white gold",
    aspect: "portrait",
  },
  {
    type: "image",
    src: "/our-work/our-work-02.webp",
    alt: "Blue topaz and silver dress cufflink worn on a white French cuff",
    aspect: "square",
  },
  {
    type: "video",
    src: "/our-work/reel-02.mp4",
    poster: "/our-work/reel-02-poster.webp",
    alt: "Film of rose gold starfish stud earrings and matching pendant",
    aspect: "reel",
  },
  {
    type: "image",
    src: "/our-work/our-work-05.webp",
    alt: "Engraved rose gold button cover styled on a patterned navy shirt",
    aspect: "square",
  },
];

const ASPECT: Record<WorkItem["aspect"], string> = {
  landscape: "aspect-[4/3]",
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  reel: "aspect-[9/16]",
};

function WorkCard({ item }: { item: WorkItem }) {
  return (
    <figure
      className={`relative h-56 md:h-72 ${ASPECT[item.aspect]} shrink-0 overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-transform duration-500 hover:scale-[1.02]`}
    >
      {item.type === "image" ? (
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="(max-width: 768px) 60vw, 24rem"
          className="object-cover"
          unoptimized
        />
      ) : (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={item.src}
          poster={item.poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={item.alt}
          ref={(el) => {
            // React can drop the muted attribute on hydration; force it so
            // programmatic play() is never blocked by autoplay policy.
            if (el) el.muted = true;
          }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/5" />
    </figure>
  );
}

function MarqueeRow({
  items,
  direction,
  duration,
}: {
  items: WorkItem[];
  direction: "left" | "right";
  duration: number;
}) {
  return (
    <div className="marquee-row group/row relative overflow-hidden">
      <div
        className={`marquee-track flex w-max items-stretch gap-4 md:gap-6 ${
          direction === "left" ? "marquee-left" : "marquee-right"
        }`}
        style={{ animationDuration: `${duration}s` }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1 || undefined}
            className="flex items-stretch gap-4 pr-4 md:gap-6 md:pr-6"
          >
            {items.map((item) => (
              <WorkCard key={`${copy}-${item.src}`} item={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OurWork() {
  const sectionRef = useRef<HTMLElement>(null);

  // Play the reels only while the section is on screen. IO is the primary
  // signal; a passive scroll fallback covers environments where IO delivery
  // lags behind rendering (same guard ScrollFX uses).
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const videos = Array.from(section.querySelectorAll("video"));
    let playing = false;

    const setPlaying = (visible: boolean) => {
      if (visible === playing) return;
      playing = visible;
      videos.forEach((v) => {
        if (visible) v.play().catch(() => {});
        else v.pause();
      });
    };

    const io = new IntersectionObserver(
      (entries) => setPlaying(entries[0].isIntersecting),
      { threshold: 0.1 },
    );
    io.observe(section);

    const checkInView = () => {
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (!vh) return;
      setPlaying(r.top < vh && r.bottom > 0);
    };
    window.addEventListener("scroll", checkInView, { passive: true });
    checkInView();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", checkInView);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="our-work"
      className="relative w-full scroll-mt-6 select-none overflow-hidden border-t border-zinc-200 bg-[#F7F4EC] py-24 md:py-32"
    >
      {/* Header */}
      <div className="mx-auto mb-12 max-w-7xl px-6 md:mb-16 md:px-12">
        <div data-reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-700">
                The Maison Portfolio
              </span>
            </div>
            <h2 className="font-serif text-4xl font-normal leading-[1.15] tracking-wide text-[#13294B] md:text-5xl">
              Our Work,
              <br />
              <span className="italic font-light text-amber-600">Worn &amp; Loved</span>
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="font-body text-sm leading-relaxed text-[#4A6285]">
              Recent commissions photographed as they left the atelier — every
              stone certified, every setting finished by hand.
            </p>
            <a href="/atelier" className="group mt-6 inline-flex items-center gap-4">
              <span className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.25em] text-[#13294B] underline decoration-amber-500/50 decoration-[1px] underline-offset-8 transition-colors duration-300 group-hover:text-amber-700">
                Commission Your Own
              </span>
              <span className="btn-luxe-orb h-10 w-10">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7m0 0H9m8 0v8" />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Two counter-drifting strips */}
      <div className="relative space-y-4 md:space-y-6">
        <MarqueeRow items={ROW_A} direction="left" duration={52} />
        <MarqueeRow items={ROW_B} direction="right" duration={64} />

        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#F7F4EC] to-transparent md:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#F7F4EC] to-transparent md:w-32" />
      </div>
    </section>
  );
}
