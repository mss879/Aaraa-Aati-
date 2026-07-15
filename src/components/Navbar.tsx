"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Collections", href: "/#collection" },
  { label: "Our Story", href: "/#about" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 md:py-6">
      <div className="relative w-full flex items-start justify-between">
        {/* Brand Logo in a rounded-edge container */}
        <Link
          href="/"
          aria-label="Ceylon Gem Maison — home"
          className="group flex items-center"
        >
          <div className="rounded-2xl border border-gold-500/25 bg-black px-3 py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.55)] ring-1 ring-white/5 transition-all duration-300 group-hover:border-gold-400/50 group-hover:shadow-[0_10px_36px_rgba(212,175,55,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3">
            <Image
              src="/logo-ceylon.png"
              alt="Ceylon Gem Maison — Luxury Jewellery"
              width={1000}
              height={1000}
              className="h-11 w-auto object-contain md:h-16"
              priority
              unoptimized
            />
          </div>
        </Link>

        {/* Desktop Menu - Centered absolutely */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-12 pt-5">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-xs tracking-[0.2em] uppercase text-gold-100/80 hover:text-gold-300 transition-colors duration-300 font-sans py-2 group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gold-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>

        {/* Action Buttons - Right-aligned */}
        <div className="hidden md:flex items-center space-x-4 pt-5">
          <a
            href="/#contact"
            className="px-6 py-2.5 rounded-full border border-white/20 text-xs tracking-[0.15em] uppercase text-white/90 hover:text-white hover:bg-white/5 hover:border-white/50 transition-all duration-300 font-sans"
          >
            Contact
          </a>
          <Link
            href="/atelier"
            className="px-6 py-2.5 rounded-full border border-gold-400/40 bg-gold-500/10 text-xs tracking-[0.15em] uppercase text-gold-200 hover:text-obsidian-950 hover:bg-gold-300 hover:border-gold-300 transition-all duration-300 font-sans"
          >
            Craft Yours
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-gold-300 hover:text-gold-200 focus:outline-none pt-2"
          aria-label="Toggle Menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="absolute top-20 left-0 right-0 mx-6 p-6 rounded-2xl bg-obsidian-950/95 border border-gold-500/10 backdrop-blur-xl md:hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col items-center space-y-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm tracking-[0.25em] uppercase text-gold-100/90 hover:text-gold-300 transition-colors font-sans"
              >
                {link.label}
              </a>
            ))}
            <div className="w-full h-[1px] bg-gold-500/10 my-2" />
            <a
              href="/#contact"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-3 rounded-full border border-white/20 text-xs tracking-[0.15em] uppercase text-white/90 hover:text-white hover:bg-white/5 hover:border-white/50 transition-all duration-300"
            >
              Contact
            </a>
            <Link
              href="/atelier"
              onClick={() => setIsOpen(false)}
              className="w-full text-center py-3 rounded-full border border-gold-400/40 bg-gold-500/10 text-xs tracking-[0.15em] uppercase text-gold-200 hover:text-obsidian-950 hover:bg-gold-300 transition-all duration-300"
            >
              Craft Yours
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
