"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * usePastHero
 * True once the visitor has scrolled clear of the page's opening act.
 *
 * The floating concierge stack uses this to stay out of the hero entirely: over
 * a full-bleed cinematic opening those buttons are three bright objects landing
 * on the one frame that was composed to be looked at. Below the fold they are
 * an offer; on the hero they are clutter.
 *
 * A page declares its opening with `data-hero` on the element that owns it —
 * for the home page that is the whole 440vh scroll-film track, not just the
 * screen you can see, so the stack waits out the film rather than the first
 * scroll. Pages with no marked hero (articles, legal) fall back to a screenful
 * of scrolling, which is the same promise made without a measurement to make it
 * from.
 */

const HERO_SELECTOR = "[data-hero]";

/** Fraction of the viewport to scroll before showing on an unmarked page. */
const FALLBACK_RATIO = 0.55;

/* How much of the hero may still be on screen when the stack arrives.
   `bottom <= 0` was the obvious rule and it was wrong: the home hero is a 440vh
   track whose film is only *pinned* for the first 340vh, so waiting for the
   track's last pixel held the stack back for a full screenful after the film had
   already slid away — the client saw them turn up two sections late.
   Seven tenths of a viewport of hero left is the moment the film has lifted
   clear of the bottom of the screen but not yet gone, which is where the gems
   land on the cream below it rather than on the film itself. Not more than that:
   the stack stands about 200px tall, and the band of cream under the film has to
   be taller than the stack or the topmost gem arrives back on the film — which
   is the thing this whole hook exists to prevent.
   Capped against the hero's own height for the short PageHero band, which is
   less than a viewport tall and would otherwise clear the bar at zero scroll. */
const HERO_ALLOWANCE_VH = 0.7;
const HERO_ALLOWANCE_SELF = 0.35;

export default function usePastHero(): boolean {
  const [past, setPast] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    /* Read straight off the event rather than coalescing into a rAF. Scroll is
       already dispatched from the rendering steps — the same point in the frame
       rAF would have waited for — so the hop bought a frame of latency and
       nothing else, and layout is clean there, making the measurement free.
       React bails on an unchanged value, so the repeat reads cost no renders. */
    const read = () => {
      /* Queried each time rather than captured once: a hero that mounts late
         (lazy media, a suspended boundary) would otherwise be missed for the
         life of the page. */
      const hero = document.querySelector<HTMLElement>(HERO_SELECTOR);
      if (!hero) {
        setPast(window.scrollY > window.innerHeight * FALLBACK_RATIO);
        return;
      }
      const rect = hero.getBoundingClientRect();
      const allowance = Math.min(
        window.innerHeight * HERO_ALLOWANCE_VH,
        rect.height * HERO_ALLOWANCE_SELF,
      );
      setPast(rect.bottom <= allowance);
    };

    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
    /* Re-armed per route: the next page has its own hero, and a client-side
       navigation lands back at the top. */
  }, [pathname]);

  return past;
}
