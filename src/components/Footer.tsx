"use client";

import React from "react";

export default function Footer() {
  return (
    <footer id="contact" className="relative w-full bg-[#020202] text-zinc-400 py-20 md:py-28 px-6 md:px-12 z-20 border-t border-zinc-900 select-none scroll-mt-6">
      <div className="max-w-7xl mx-auto">

        {/* Main Grid */}
        <div data-reveal-group className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-16 border-b border-zinc-900">
          
          {/* Brand Info Column */}
          <div className="space-y-6">
            <h3 className="text-2xl font-normal text-white tracking-widest font-serif uppercase">
              Ceylon Gem Maison
            </h3>
            <p className="text-[0.82rem] md:text-sm text-zinc-400 font-sans leading-relaxed max-w-xs">
              Crafting timeless, ethically sourced diamond masterpieces and bespoke high jewelry for generations. Designed in Sri Lanka, worn worldwide.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 text-zinc-500 pt-2">
              <a href="#" className="hover:text-gold-300 transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051c-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="#" className="hover:text-gold-300 transition-colors" aria-label="Pinterest">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.907 2.17-2.907 1.025 0 1.522.771 1.522 1.692 0 1.03-.657 2.571-.994 4.002-.285 1.199.6 2.175 1.78 2.175 2.136 0 3.774-2.254 3.774-5.51 0-2.881-2.07-4.896-5.017-4.896-3.414 0-5.419 2.561-5.419 5.208 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.621 0 11.988-5.366 11.988-11.987C23.999 5.368 18.631 0 12.017 0z" />
                </svg>
              </a>
              <a href="#" className="hover:text-gold-300 transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Collections Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-[0.2em] text-white uppercase font-sans">
              Collections
            </h4>
            <ul className="space-y-3 text-[0.82rem] md:text-sm font-sans">
              <li>
                <a href="/collections?f=rings" className="hover:text-gold-200 transition-colors">Engagement & Bridal</a>
              </li>
              <li>
                <a href="/collections?f=rings" className="hover:text-gold-200 transition-colors">Signature Diamond Rings</a>
              </li>
              <li>
                <a href="/collections?f=necklaces" className="hover:text-gold-200 transition-colors">High Gemstone Necklaces</a>
              </li>
              <li>
                <a href="/collections?f=earrings" className="hover:text-gold-200 transition-colors">Atelier Diamond Earrings</a>
              </li>
              <li>
                <a href="/collections?f=bracelets" className="hover:text-gold-200 transition-colors">Fine Wavy Bracelets</a>
              </li>
            </ul>
          </div>

          {/* Atelier Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-[0.2em] text-white uppercase font-sans">
              The Atelier
            </h4>
            <ul className="space-y-3 text-[0.82rem] md:text-sm font-sans">
              <li>
                <a href="/about" className="hover:text-gold-200 transition-colors">Our Sri Lankan Heritage</a>
              </li>
              <li>
                <a href="/about#values" className="hover:text-gold-200 transition-colors">Ethical Sourcing Pledge</a>
              </li>
              <li>
                <a href="/atelier" className="hover:text-gold-200 transition-colors">Bespoke Design CAD</a>
              </li>
              <li>
                <a href="/about#values" className="hover:text-gold-200 transition-colors">Care & Lifetime Warranty</a>
              </li>
              <li>
                <a href="/contact" className="hover:text-gold-200 transition-colors">Book Private Appointment</a>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold tracking-[0.2em] text-white uppercase font-sans">
              Atelier Newsletter
            </h4>
            <p className="text-[0.82rem] md:text-sm text-zinc-400 font-sans leading-relaxed">
              Subscribe to view private catalogs, preview custom drops, and receive invite-only event details.
            </p>
            <form className="relative flex items-center pt-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent border-b border-zinc-800 text-white placeholder-zinc-500 text-sm py-2.5 pr-10 focus:outline-none focus:border-gold-300 w-full font-sans tracking-wide transition-colors"
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

        {/* Bottom Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-10 text-[0.7rem] md:text-[0.75rem] font-sans tracking-widest uppercase">

          {/* Copyright */}
          <div>
            &copy; 2026 Ceylon Gem Maison. All Rights Reserved.
          </div>

          {/* Ethical Statement */}
          <div className="text-zinc-500 text-center max-w-sm lg:max-w-none">
            Ethically sourced conflict-free diamonds and materials only.
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gold-200 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold-200 transition-colors">Terms of Service</a>
          </div>

        </div>

      </div>
    </footer>
  );
}
