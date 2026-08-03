"use client";

/**
 * LuxeCursor — a soft gold companion ring that trails the pointer and blooms
 * over interactive elements. It accompanies (never replaces) the native
 * cursor, and renders nothing on touch devices or for reduced-motion users.
 *
 * Currently switched off: the component is retained (and still mounted by the
 * pages that used it) so the effect can be restored without touching eleven
 * call sites, but it renders nothing and its React/GSAP imports are gone —
 * they were dead weight and the only ESLint warnings in the codebase.
 */
export default function LuxeCursor() {
  return null;
}
