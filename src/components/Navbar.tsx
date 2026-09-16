"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Our Story", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Journal", href: "/articles" },
];

/**
 * The maison's white bar, pinned to the top of every marketing page.
 *
 * Mounted once in the root layout rather than inside each hero, because every
 * hero is an `overflow-hidden` sticky stage and a bar nested in one of those
 * scrolls away with it. It is `fixed`, not in-flow, so the full-bleed heroes
 * keep their height and the `pt-40`-ish top padding those pages already carry
 * still clears it exactly as before.
 */
export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // /admin is the back office: it has its own shell and no business carrying
  // marketing chrome. Everything public gets this bar, the atelier included —
  // pages clear it with --nav-h, since it is fixed and takes no space in flow.
  if (pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#13294B]/10 bg-white shadow-[0_1px_24px_rgba(19,41,75,0.07)]">
      <div className="relative mx-auto flex w-full items-center justify-between px-4 py-2.5 md:px-8 md:py-3">
        {/* Brand */}
        <Link href="/" aria-label="Ceylon Gem Maison — home" className="group flex items-center">
          <Image
            src="/main-logo.png"
            alt="Ceylon Gem Maison — Luxury Jewellery"
            width={1565}
            height={444}
            className="h-9 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80 md:h-11"
            priority
          />
        </Link>

        {/* Desktop menu — centered.

            Shown from xl (1280px), not md (768px). This block is absolutely
            positioned and centred on the bar, so when the viewport gets tight it
            cannot reflow — it simply slides underneath the right-hand buttons.
            The three pieces need 155px of logo + 347px of links + 348px of
            buttons + 64px of padding, and because the links are centred while the
            buttons are flush right, the two only clear each other above ~1107px.
            That is why this is xl and not lg: at 1024px "Services" was still
            sitting under the Contact button. Below xl the hamburger takes over. */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center space-x-12 xl:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative py-2 font-sans text-[0.78rem] font-medium uppercase tracking-[0.2em] text-[#13294B]/75 transition-colors duration-300 hover:text-gold-600"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-gold-500 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Actions — same xl gate as the centred links above. */}
        <div className="hidden items-center space-x-3 xl:flex">
          <Link
            href="/contact"
            className="btn-platinum"
          >
            <span>Contact</span>
          </Link>
          <Link
            href="/atelier"
            className="btn-luxe-pill"
          >
            <span>Craft Yours</span>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-[#13294B] transition-colors hover:text-gold-600 focus:outline-none xl:hidden"
          aria-label="Toggle Menu"
          aria-expanded={isOpen}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="absolute inset-x-0 top-full border-b border-[#13294B]/10 bg-white p-6 shadow-[0_18px_40px_rgba(19,41,75,0.10)] duration-300 animate-in fade-in slide-in-from-top-4 xl:hidden">
          <div className="flex flex-col items-center space-y-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-sans text-sm font-medium uppercase tracking-[0.25em] text-[#13294B]/80 transition-colors hover:text-gold-600"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-[1px] w-full bg-[#13294B]/10" />
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="btn-platinum w-full"
            >
              <span>Contact</span>
            </Link>
            <Link
              href="/atelier"
              onClick={() => setIsOpen(false)}
              className="btn-luxe-pill w-full"
            >
              <span>Craft Yours</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
