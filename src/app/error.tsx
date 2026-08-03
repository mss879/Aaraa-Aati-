"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary. Catches a render or data failure anywhere under
 * the root layout and offers a retry, rather than dropping the visitor onto
 * Next's unstyled default error screen in production.
 *
 * The navbar and footer come from the layout, which survives this boundary, so
 * the visitor never loses their way out of the page.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side details are stripped in production; the digest is the only
    // handle that ties this screen to the server log entry.
    console.error("Unhandled route error", error.digest ?? error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#0A1F3D] px-6 py-28 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(46,91,224,0.22),transparent_60%)]"
      />
      <div className="relative z-10 w-full max-w-xl">
        <p className="font-sans text-[0.68rem] font-medium uppercase tracking-[0.4em] text-gold-300">
          Something interrupted us
        </p>
        <h1 className="mt-5 font-serif text-4xl font-light leading-[1.1] tracking-wide text-gold-50 md:text-5xl">
          A Momentary <span className="italic text-gold-200">Flaw</span>
        </h1>
        <p className="mt-6 font-body text-base font-light leading-relaxed tracking-wide text-[#A9B8D0]">
          This page didn&rsquo;t load as it should. Try once more — and if it persists,
          our concierge will gladly help you directly.
        </p>
        {error.digest && (
          <p className="mt-4 font-sans text-[0.62rem] uppercase tracking-[0.28em] text-[#5E7495]">
            Reference {error.digest}
          </p>
        )}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button type="button" onClick={reset} className="btn-luxe-pill w-full sm:w-auto">
            Try Again
          </button>
          <Link href="/contact" className="btn-platinum w-full sm:w-auto">
            Contact the Maison
          </Link>
        </div>
      </div>
    </main>
  );
}
