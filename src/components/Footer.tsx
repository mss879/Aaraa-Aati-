"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FACEBOOK_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  WHATSAPP_DISPLAY,
  whatsAppLink,
} from "@/lib/contact";

/** Social channels. Paths are the standard 24x24 brand glyphs. */
const SOCIALS = [
  {
    label: "Instagram",
    href: INSTAGRAM_URL,
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051c-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "Facebook",
    href: FACEBOOK_URL,
    path: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z",
  },
  {
    label: "LinkedIn",
    href: LINKEDIN_URL,
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 110-4.124 2.062 2.062 0 010 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: `WhatsApp ${WHATSAPP_DISPLAY}`,
    href: whatsAppLink("Hello Ceylon Gem Maison — I would like to enquire about a piece."),
    path: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.347-.347.52-.52.174-.174.232-.298.347-.497.115-.198.057-.371-.058-.52-.115-.148-.646-1.558-.885-2.132-.233-.56-.47-.487-.646-.495-.167-.008-.359-.01-.55-.01-.192 0-.504.072-.767.36-.264.288-1.006.982-1.006 2.394 0 1.413 1.03 2.777 1.173 2.975.144.198 2.026 3.229 4.91 4.412.685.297 1.22.474 1.637.607.688.219 1.314.188 1.809.114.552-.082 1.72-.703 1.963-1.382.242-.68.242-1.262.169-1.384-.072-.123-.264-.198-.56-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.898 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M20.463 3.488A11.78 11.78 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.548 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.48-8.413",
  },
];

export default function Footer() {
  return (
    <footer id="contact" className="relative w-full bg-[#071527] text-[#A9B8D0] pt-20 md:pt-28 pb-10 md:pb-12 px-6 md:px-12 z-20 border-t border-[#1D3D6B] select-none scroll-mt-6">
      <div className="max-w-7xl mx-auto">

        {/* Main Grid */}
        <div data-reveal-group className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-16 border-b border-[#1D3D6B]">
          
          {/* Brand Info Column */}
          <div className="space-y-6">
            {/* The maison's stacked footer mark. Unlike main-logo.png this artwork
                is a JPEG carrying its own flat navy ground (#011538), a shade off
                the footer's #071527 — so it is framed as a deliberate plaque with
                the same hairline the social buttons use, rather than left to read
                as a stray lighter square. No brightness/invert here: the mark is
                already drawn light-on-dark. */}
            <Image
              src="/footer-logo.jpeg"
              alt="Ceylon Gem Maison"
              width={305}
              height={305}
              className="h-32 w-32 rounded-md border border-[#27497A] object-contain md:h-36 md:w-36"
            />
            <p className="text-[0.82rem] md:text-sm text-[#A9B8D0] font-body leading-relaxed max-w-xs">
              Crafting timeless, ethically sourced diamond masterpieces and bespoke high jewelry for generations. Designed in Sri Lanka, worn worldwide.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2 text-[#8DA2C4]">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-[#27497A] transition-colors duration-300 hover:border-gold-300 hover:text-gold-300"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Collections Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-[0.2em] text-white uppercase font-sans">
              Collections
            </h4>
            <ul className="space-y-3 text-[0.82rem] md:text-sm font-body">
              <li>
                <Link href="/collections?f=rings" className="hover:text-gold-200 transition-colors">Engagement & Bridal</Link>
              </li>
              <li>
                <Link href="/collections?f=rings" className="hover:text-gold-200 transition-colors">Signature Diamond Rings</Link>
              </li>
              <li>
                <Link href="/collections?f=necklaces" className="hover:text-gold-200 transition-colors">High Gemstone Necklaces</Link>
              </li>
              <li>
                <Link href="/collections?f=earrings" className="hover:text-gold-200 transition-colors">Atelier Diamond Earrings</Link>
              </li>
              <li>
                <Link href="/collections?f=bracelets" className="hover:text-gold-200 transition-colors">Fine Wavy Bracelets</Link>
              </li>
            </ul>
          </div>

          {/* Maison Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-[0.2em] text-white uppercase font-sans">
              The Maison
            </h4>
            <ul className="space-y-3 text-[0.82rem] md:text-sm font-body">
              <li>
                <Link href="/about" className="hover:text-gold-200 transition-colors">Our Story &amp; Heritage</Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-gold-200 transition-colors">Private Client Services</Link>
              </li>
              <li>
                <Link href="/atelier" className="hover:text-gold-200 transition-colors">The Digital Atelier</Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-gold-200 transition-colors">The Journal</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-200 transition-colors">Book Private Appointment</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-[0.2em] text-white uppercase font-sans">
              Atelier Newsletter
            </h4>
            <p className="text-[0.82rem] md:text-sm text-[#A9B8D0] font-body leading-relaxed">
              Subscribe to view private catalogs, preview custom drops, and receive invite-only event details.
            </p>
            <form className="relative flex items-center pt-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent border-b border-[#27497A] text-white placeholder-zinc-500 text-sm py-2.5 pr-10 focus:outline-none focus:border-gold-300 w-full font-body tracking-wide transition-colors"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gold-300 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </div>

        </div>

        {/* Sapphire Guides — sitewide links to the SEO pillar guides */}
        <div className="pt-10 pb-10 border-b border-[#1D3D6B]">
          <h4 className="text-xs font-semibold tracking-[0.2em] text-white uppercase font-sans mb-5">
            Sapphire Guides
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-3 text-[0.82rem] md:text-sm font-body">
            <li>
              <Link href="/ceylon-sapphire-engagement-ring-singapore" className="hover:text-gold-200 transition-colors">
                Ceylon Sapphire Engagement Rings
              </Link>
            </li>
            <li>
              <Link href="/ceylon-sapphire-ring-singapore" className="hover:text-gold-200 transition-colors">
                Ceylon Sapphire Rings
              </Link>
            </li>
            <li>
              <Link href="/bespoke-sapphire-engagement-ring-singapore" className="hover:text-gold-200 transition-colors">
                Bespoke Sapphire Engagement Rings
              </Link>
            </li>
            <li>
              <Link href="/blue-sapphire-engagement-ring-singapore" className="hover:text-gold-200 transition-colors">
                Blue Sapphire Engagement Rings
              </Link>
            </li>
            <li>
              <Link href="/sri-lankan-sapphire-ring-singapore" className="hover:text-gold-200 transition-colors">
                Sri Lankan Sapphire Rings
              </Link>
            </li>
            <li>
              <Link href="/custom-sapphire-ring-singapore" className="hover:text-gold-200 transition-colors">
                Custom Sapphire Rings
              </Link>
            </li>
            <li>
              <Link href="/design-your-own-sapphire-ring-singapore" className="hover:text-gold-200 transition-colors">
                Design Your Own Sapphire Ring
              </Link>
            </li>
            <li>
              <Link href="/natural-blue-sapphire-ring-singapore" className="hover:text-gold-200 transition-colors">
                Natural Blue Sapphire Rings
              </Link>
            </li>
          </ul>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-10 text-[0.7rem] md:text-[0.75rem] font-sans tracking-widest uppercase">

          {/* Copyright */}
          <div>
            &copy; 2026 Ceylon Gem Maison. All Rights Reserved.
          </div>

          {/* Ethical Statement */}
          <div className="text-[#5E7495] text-center max-w-sm lg:max-w-none">
            Ethically sourced conflict-free gemstones and materials only.
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gold-200 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gold-200 transition-colors">Terms of Service</Link>
          </div>

        </div>

        {/* Agency Credit */}
        <div className="pt-8 mt-8 border-t border-[#1D3D6B]/70 text-center text-[0.68rem] md:text-[0.72rem] font-sans tracking-[0.18em] uppercase text-[#5E7495]">
          Designed and built by{" "}
          <a
            href="https://www.arcai.agency"
            target="_blank"
            rel="noopener"
            title="ARC AI — Premium Web Design & AI Development Agency"
            className="text-gold-300 hover:text-gold-200 transition-colors font-medium inline-flex items-center gap-1.5 align-middle ml-1"
          >
            <Image
              src="/arc-logo.webp"
              alt="ARC AI — Premium Web Design & AI Development Agency"
              width={120}
              height={36}
              className="h-7 md:h-8 w-auto object-contain brightness-110 transition-transform hover:scale-105"
            />
          </a>
        </div>

      </div>
    </footer>
  );
}
