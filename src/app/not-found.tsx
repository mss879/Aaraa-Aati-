import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Page Not Found",
  /**
   * This has to be stated even though Next injects its own `noindex` for the
   * not-found route: without it the root layout's `index, follow` is inherited
   * and the head ends up carrying one tag of each. Two agreeing `noindex` tags
   * is the tidier of the two available outcomes — the duplicate is Next's and
   * can't be suppressed. `follow` so the links out of this page are still
   * crawled and the 404 doesn't strand link equity.
   */
  robots: { index: false, follow: true },
};

/**
 * 404. Without this file Next serves its own bare black-on-white page — no
 * navbar, no footer, no way back into the site, and nothing that looks like the
 * maison. Built entirely from existing tokens (the navy stage, the cream body,
 * the house pill buttons), so it reads as the same site rather than a new one.
 */

const ELSEWHERE = [
  { href: "/collections", label: "The Collections", note: "Rings, necklaces, earrings, bracelets" },
  { href: "/shop", label: "Shop the Maison", note: "Finished pieces, ready to order" },
  { href: "/atelier", label: "The Bespoke Atelier", note: "Design your own, in live 3D" },
  { href: "/articles", label: "The Journal", note: "Guides from the bench" },
];

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen w-full flex-col bg-[#F7F4EC]">
      <section className="relative w-full overflow-hidden bg-[#0A1F3D]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(46,91,224,0.28),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(191,155,67,0.16),transparent_50%)]"
        />
        <div className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-20 pt-40 text-center md:px-10 md:pb-28 md:pt-48">
          <p className="font-sans text-[0.68rem] font-medium uppercase tracking-[0.4em] text-gold-300">
            Error 404
          </p>
          <h1 className="mt-5 font-serif text-4xl font-light leading-[1.1] tracking-wide text-gold-50 md:text-6xl">
            This Setting Is{" "}
            <span className="italic text-gold-200">Empty</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-body text-base font-light leading-relaxed tracking-wide text-[#A9B8D0]">
            The page you asked for isn&rsquo;t here — it may have been moved, or the
            piece it described may already have found its owner. Everything else is
            exactly where you left it.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/" className="btn-luxe-pill w-full sm:w-auto">
              Return to the Maison
            </Link>
            <Link href="/contact" className="btn-platinum w-full sm:w-auto">
              Ask the Concierge
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-5xl">
          <p className="text-center font-sans text-[0.68rem] font-medium uppercase tracking-[0.32em] text-amber-700">
            Perhaps you were looking for
          </p>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-sm bg-zinc-200 sm:grid-cols-2">
            {ELSEWHERE.map((item) => (
              <li key={item.href} className="bg-[#F7F4EC]">
                <Link
                  href={item.href}
                  className="group flex h-full flex-col justify-center bg-white/60 px-7 py-8 transition-colors hover:bg-white"
                >
                  <span className="font-serif text-xl font-normal tracking-wide text-[#13294B] transition-colors group-hover:text-amber-700 md:text-2xl">
                    {item.label}
                  </span>
                  <span className="mt-2 font-body text-sm font-light leading-relaxed text-[#5E7495]">
                    {item.note}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
