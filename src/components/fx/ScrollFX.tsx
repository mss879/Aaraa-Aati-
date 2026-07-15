"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * ScrollFX
 * A declarative GSAP layer for the marketing pages. Server components stay
 * server components — they just opt in with data attributes:
 *
 *  data-reveal            fade-rise in when scrolled into view
 *  data-reveal="left"     …slide in from the left ("right", "zoom" too)
 *  data-reveal-group      stagger-reveal all direct children
 *  data-parallax="0.15"   drift vertically at the given speed while scrolling
 *  data-tilt              subtle 3D tilt toward the cursor (fine pointers only)
 *
 * Reveals are triggered by IntersectionObserver rather than ScrollTrigger:
 * IO evaluates against the browser's real visual viewport at scroll time, so
 * content can never be stranded invisible by a bad viewport measurement at
 * init (embedded/background tabs can report window.innerHeight === 0, which
 * would freeze position-based triggers). Everything is skipped for
 * prefers-reduced-motion users.
 */
export default function ScrollFX() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    /* ---------------- reveals (IntersectionObserver-driven) ---------------- */

    type Item = {
      sentinel: HTMLElement;
      targets: HTMLElement[];
      from: gsap.TweenVars;
      stagger: number;
      played: boolean;
    };
    const items: Item[] = [];

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
      const kind = el.dataset.reveal || "up";
      const from: gsap.TweenVars = { opacity: 0 };
      if (kind === "left") from.x = -56;
      else if (kind === "right") from.x = 56;
      else if (kind === "zoom") from.scale = 0.92;
      else from.y = 48;
      items.push({ sentinel: el, targets: [el], from, stagger: 0, played: false });
    });

    document.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
      const children = Array.from(group.children).filter(
        (c): c is HTMLElement => c instanceof HTMLElement,
      );
      if (!children.length) return;
      items.push({
        sentinel: group,
        targets: children,
        from: { opacity: 0, y: 44 },
        stagger: 0.12,
        played: false,
      });
    });

    const allTargets = items.flatMap((it) => it.targets);

    // Hide instantly: suspend each target's own CSS transitions (Tailwind
    // transition-all would otherwise animate/fight every inline write).
    allTargets.forEach((t) => (t.style.transition = "none"));
    items.forEach((it) => gsap.set(it.targets, it.from));

    const playItem = (it: Item) => {
      if (it.played) return;
      it.played = true;
      io.unobserve(it.sentinel);
      gsap.to(it.targets, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        duration: 1,
        ease: "power3.out",
        stagger: it.stagger,
        // Hand styling fully back to the stylesheet (restores hover
        // transitions and drops the inline transform/opacity).
        onComplete: () => gsap.set(it.targets, { clearProps: "all" }),
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const it = items.find((i) => i.sentinel === entry.target);
          if (it) playItem(it);
        });
      },
      // Fire once any part of the element enters the lower 90% of the screen.
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    items.forEach((it) => io.observe(it.sentinel));

    // Fallback for environments where IO delivery lags (background/embedded
    // tabs throttle rendering steps): scroll events still fire there, so
    // reveal anything whose live rect is already on screen.
    const checkInView = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (!vh) return;
      items.forEach((it) => {
        if (it.played) return;
        const r = it.sentinel.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) playItem(it);
      });
    };
    window.addEventListener("scroll", checkInView, { passive: true });
    // A few timed sweeps cover restored scroll positions and late layout.
    const warmup = window.setInterval(checkInView, 700);
    const warmupStop = window.setTimeout(() => clearInterval(warmup), 5000);

    /* ---------------- parallax drift (scrubbed, ScrollTrigger) ---------------- */

    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0.15");
        gsap.to(el, {
          yPercent: speed * 100,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            scrub: 0.6,
            start: "top bottom",
            end: "bottom top",
          },
        });
      });
    });

    /* ---------------- pointer tilt (fine pointers only) ---------------- */

    const tiltCleanups: (() => void)[] = [];
    if (window.matchMedia("(pointer: fine)").matches) {
      document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
        el.style.transformStyle = "preserve-3d";
        const setRX = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power2.out" });
        const setRY = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power2.out" });

        const move = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          gsap.set(el, { transformPerspective: 900 });
          setRX(-py * 7);
          setRY(px * 7);
        };
        const leave = () => {
          setRX(0);
          setRY(0);
        };
        el.addEventListener("mousemove", move);
        el.addEventListener("mouseleave", leave);
        tiltCleanups.push(() => {
          el.removeEventListener("mousemove", move);
          el.removeEventListener("mouseleave", leave);
        });
      });
    }

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", checkInView);
      clearInterval(warmup);
      clearTimeout(warmupStop);
      gsap.killTweensOf(allTargets);
      allTargets.forEach((t) => {
        gsap.set(t, { clearProps: "all" });
        t.style.transition = "";
      });
      ctx.revert();
      tiltCleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
