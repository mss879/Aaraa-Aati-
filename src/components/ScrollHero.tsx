"use client";

import { useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";

/**
 * ScrollHero
 * A scroll-scrubbed cinematic hero. The luxury ring film (public/hero/ring-story.mp4,
 * re-encoded all-intra so every frame is instantly seekable) is pinned full-screen and
 * its playhead is driven by scroll position. Editorial copy for each act of the film
 * fades in and out at the exact scroll window where that scene is on screen.
 *
 * The film runs Sketch -> 3D Craft -> Reveal on silk -> Worn on the hand.
 */

// Usable length of the film in seconds (the 10s source, trimmed a hair off the tail).
const DURATION = 9.95;

// How many viewport heights of scroll the pinned hero occupies while scrubbing.
const TRACK_VH = 440;

type Scene = {
  eyebrow: string;
  lines: [string, string];
  // Progress window (0..1 of the scroll track), tuned to the film's cut points:
  //  in    -> starts fading in
  //  peak  -> fully visible
  //  fade  -> starts fading out
  //  out   -> fully gone
  in: number;
  peak: number;
  fade: number;
  out: number;
  cta?: boolean;
};

const SCENES: Scene[] = [
  {
    // Film 0.0–2.5s  ·  the pencil blueprint on paper
    eyebrow: "I · The Sketch",
    lines: ["A legend begins", "with a single line"],
    in: -0.05, // fully visible at the very top of the page
    peak: 0.0,
    fade: 0.19,
    out: 0.235,
  },
  {
    // Film 2.5–4.65s  ·  the drawing becomes a glowing 3D form
    eyebrow: "II · The Craft",
    lines: ["Shaped to a", "flawless geometry"],
    in: 0.275,
    peak: 0.32,
    fade: 0.43,
    out: 0.465,
  },
  {
    // Film 4.65–7.1s  ·  the finished solitaire revealed on black silk
    eyebrow: "III · The Reveal",
    lines: ["Brilliance,", "fully realised"],
    in: 0.505,
    peak: 0.55,
    fade: 0.67,
    out: 0.71,
  },
  {
    // Film 7.1–10s  ·  worn on the hand it was made for
    eyebrow: "IV · Forever Yours",
    lines: ["Made to be", "yours, always"],
    in: 0.75,
    peak: 0.8,
    fade: 1.1, // stays visible through the end of the track
    out: 1.2,
    cta: true,
  },
];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
// Smoothstep easing between edges a and b.
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export default function ScrollHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hintRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Paint each scene's copy for a given scroll progress p (0..1).
  const paintScenes = (p: number) => {
    let active = 0;
    SCENES.forEach((s, i) => {
      const el = sceneRefs.current[i];
      if (!el) return;
      const opIn = smooth(s.in, s.peak, p);
      const opOut = 1 - smooth(s.fade, s.out, p);
      const op = Math.min(opIn, opOut);
      // Drift up on the way in, and continue drifting up on the way out.
      const enterY = (1 - opIn) * 30;
      const exitY = smooth(s.fade, s.out, p) * -30;
      el.style.opacity = String(op);
      el.style.transform = `translate3d(0, ${enterY + exitY}px, 0)`;
      el.style.filter = op < 0.999 ? `blur(${(1 - op) * 7}px)` : "none";
      // Keep faded-out acts fully non-interactive — out of the pointer AND keyboard/AT
      // path — so invisible CTAs can't be tabbed to or read out.
      const interactive = op > 0.6;
      el.style.pointerEvents = interactive ? "auto" : "none";
      el.inert = !interactive;
      if (p >= s.in) active = i;
    });
    dotRefs.current.forEach((d, i) => {
      if (!d) return;
      const on = i === active;
      d.style.height = on ? "26px" : "7px";
      d.style.backgroundColor = on ? "var(--color-gold-300)" : "rgba(255,255,255,0.28)";
    });
    if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    if (hintRef.current) hintRef.current.style.opacity = String(1 - smooth(0.004, 0.05, p));
  };

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Pick the source weight by viewport.
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    video.src = isMobile ? "/hero/ring-story-mobile-rebranded.mp4" : "/hero/ring-story-rebranded.mp4";
    video.load();

    let raf = 0;
    let running = false;

    const progress = () => {
      const rect = section.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      return total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
    };

    const tick = () => {
      const p = progress();

      // Drive the film's playhead toward the scroll target, lerped for silky scrubbing.
      // Gate on !video.seeking: WebKit/iOS process seeks serially and drop a flood of
      // per-frame currentTime writes, so only issue the next seek once the last finished.
      if (!video.seeking && video.readyState >= 2 && Number.isFinite(video.duration)) {
        const cap = Math.min(DURATION, video.duration - 0.05);
        const target = p * cap;
        const cur = video.currentTime;
        const diff = target - cur;
        if (Math.abs(diff) > 0.005) {
          const next = Math.abs(diff) < 0.08 ? target : cur + diff * 0.22;
          try {
            video.currentTime = next;
          } catch {
            /* seek not ready */
          }
        }
      }

      paintScenes(p);
      if (running) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    // Prime the element so mobile Safari paints seeked frames (muted autoplay is allowed).
    // If autoplay is blocked (e.g. iOS Low Power Mode), unlock on the first user gesture
    // so the film still scrubs after the user touches the page.
    let unlock: (() => void) | null = null;
    const prime = () => {
      const played = video.play();
      if (!played || !played.then) return;
      played
        .then(() => {
          video.pause();
          video.currentTime = 0.0001;
        })
        .catch(() => {
          if (unlock) return;
          unlock = () => {
            video.play().then(() => video.pause()).catch(() => {});
            if (unlock) {
              window.removeEventListener("pointerdown", unlock);
              window.removeEventListener("touchstart", unlock);
            }
            unlock = null;
          };
          window.addEventListener("pointerdown", unlock, { passive: true });
          window.addEventListener("touchstart", unlock, { passive: true });
        });
    };

    // Reduced motion: no scroll hijack — collapse the track and rest statically on the reveal.
    if (prefersReduced) {
      section.style.height = "calc(100svh - 20px)";
      const rest = () => {
        const cap = Math.min(DURATION, video.duration - 0.05);
        const t = Number.isFinite(cap) ? cap * 0.86 : 0;
        paintScenes(1);
        // Land on the reveal frame as the LAST write regardless of play()/seek ordering.
        video
          .play()
          .then(() => {
            video.pause();
            video.currentTime = t;
          })
          .catch(() => {
            video.currentTime = t;
          });
      };
      video.addEventListener("loadeddata", rest, { once: true });
      if (video.readyState >= 2) rest();
      return () => video.removeEventListener("loadeddata", rest);
    }

    video.addEventListener("loadeddata", prime, { once: true });
    if (video.readyState >= 2) prime();

    // Paint the correct first frame immediately (handles reload at a restored scroll pos),
    // then only run the loop while the hero is actually on screen.
    paintScenes(progress());
    const io = new IntersectionObserver(
      (entries) => (entries[0].isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(section);

    return () => {
      stop();
      io.disconnect();
      video.removeEventListener("loadeddata", prime);
      if (unlock) {
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("touchstart", unlock);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="The making of a Ceylon Gem Maison solitaire"
      className="relative z-10 w-full"
      style={{ height: `${TRACK_VH}vh` }}
    >
      <div
        ref={stageRef}
        className="sticky top-0 h-svh w-full overflow-hidden bg-[#0A1F3D]"
      >
        {/* Scroll-scrubbed film */}
        <video
          ref={videoRef}
          className="absolute inset-0 z-0 h-full w-full object-cover"
          poster="/hero/poster.jpg"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          disablePictureInPicture
        />

        {/* Readability overlays */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/65 via-black/20 to-black/85" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(0,0,0,0.72)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Navigation */}
        <div className="relative z-40">
          <Navbar />
        </div>

        {/* Chapter markers */}
        <div className="absolute right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-2.5 md:flex">
          {SCENES.map((_, i) => (
            <span
              key={i}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              className="w-[3px] rounded-full transition-[height,background-color] duration-500 ease-out"
              style={{ height: "7px", backgroundColor: "rgba(255,255,255,0.28)" }}
            />
          ))}
        </div>

        {/* Scene copy — all acts stacked in one grid cell, bottom-aligned, cross-fading */}
        <div className="absolute inset-x-0 bottom-0 z-30 px-6 pb-16 md:px-16 md:pb-20">
          <div className="grid max-w-2xl items-end">
            {SCENES.map((s, i) => {
              // One <h1> for the page; the remaining acts are <h2> for a sane outline.
              const Heading = i === 0 ? "h1" : "h2";
              return (
              <div
                key={i}
                ref={(el) => {
                  sceneRefs.current[i] = el;
                }}
                className="col-start-1 row-start-1 will-change-[opacity,transform]"
                style={{ opacity: i === 0 ? 1 : 0 }}
                inert={i === 0 ? undefined : true}
              >
                <p className="mb-4 font-sans text-[0.72rem] font-medium uppercase tracking-[0.42em] text-gold-300 md:text-xs">
                  {s.eyebrow}
                </p>
                <Heading className="font-serif text-[2.6rem] font-light leading-[1.04] tracking-wide text-gold-50 md:text-6xl lg:text-[4.4rem]">
                  {s.lines[0]}
                  <br />
                  <span className="italic text-gold-200">{s.lines[1]}</span>
                </Heading>
                {s.cta && (
                  <div className="flex flex-col gap-6 pt-8 sm:flex-row">
                    <a
                      href="#collection"
                      className="group inline-flex items-center gap-3"
                    >
                      <span className="btn-luxe-pill px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.2em]">
                        Explore Collection
                      </span>
                      <span className="btn-luxe-orb btn-luxe-orb--light h-12 w-12">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7m0 0H9m8 0v8" />
                        </svg>
                      </span>
                    </a>
                    <a
                      href="/atelier"
                      className="group inline-flex items-center gap-3"
                    >
                      <span className="rounded-full border border-gold-400/30 px-8 py-3.5 text-center font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold-200 backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-gold-300/60 group-hover:bg-gold-500/10 active:translate-y-0">
                        Design Your Own
                      </span>
                      <span className="btn-luxe-orb btn-luxe-orb--light h-12 w-12">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7m0 0H9m8 0v8" />
                        </svg>
                      </span>
                    </a>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* Scroll hint (desktop only — collides with copy on narrow screens) */}
        <div
          ref={hintRef}
          className="pointer-events-none absolute bottom-7 left-1/2 z-40 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
        >
          <span className="font-sans text-[0.65rem] uppercase tracking-[0.4em] text-gold-100/80">
            Scroll to unfold
          </span>
          <span className="relative block h-8 w-px overflow-hidden bg-white/15">
            <span className="absolute left-0 top-0 h-3 w-full animate-[heroScrollLine_1.8s_ease-in-out_infinite] bg-gold-300" />
          </span>
        </div>

        {/* Meta strip */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-center justify-between px-6 pb-4 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-gold-100/75 md:px-16 md:text-[0.7rem]">
          <span>Ceylon · Singapore</span>
          <span className="hidden sm:block">One Sketch · One Solitaire · One Forever</span>
          <span>Bespoke Atelier</span>
        </div>

        {/* Scrub progress line */}
        <div className="absolute inset-x-0 bottom-0 z-50 h-[2px] bg-white/10">
          <div
            ref={barRef}
            className="h-full origin-left bg-gradient-to-r from-gold-500 via-gold-300 to-gold-100"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </section>
  );
}
