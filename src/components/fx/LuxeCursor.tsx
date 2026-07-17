"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * LuxeCursor — a soft gold companion ring that trails the pointer and blooms
 * over interactive elements. It accompanies (never replaces) the native
 * cursor, and renders nothing on touch devices or for reduced-motion users.
 */
export default function LuxeCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !window.matchMedia("(pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    gsap.set([ring, dot], { xPercent: -50, yPercent: -50, opacity: 0 });

    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power2.out" });

    let visible = false;
    const move = (e: MouseEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([ring, dot], { opacity: 1, duration: 0.3 });
      }
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);

      const interactive = (e.target as Element | null)?.closest?.(
        "a, button, [role='button'], input, [data-tilt], .cursor-pointer, .cursor-grab",
      );
      gsap.to(ring, {
        scale: interactive ? 1.9 : 1,
        borderColor: interactive ? "rgba(46,91,224,0.9)" : "rgba(46,91,224,0.45)",
        duration: 0.35,
        ease: "power2.out",
      });
    };
    const hide = () => {
      visible = false;
      gsap.to([ring, dot], { opacity: 0, duration: 0.25 });
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", hide);

    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", hide);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-9 w-9 rounded-full border border-gold-300/45 mix-blend-screen"
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full bg-gold-300 shadow-[0_0_10px_rgba(46,91,224,0.9)] mix-blend-screen"
      />
    </>
  );
}
