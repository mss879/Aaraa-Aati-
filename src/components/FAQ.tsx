"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "@/lib/faq";

/**
 * FAQ
 * Luxury accordion for the homepage. The expanding panel uses the CSS
 * grid-rows trick so height animates smoothly without measuring content.
 * FAQPage JSON-LD for these items is emitted by the page, from the same
 * FAQ_ITEMS source of truth.
 */
export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="w-full scroll-mt-6 select-none border-t border-zinc-200 bg-[#F7F4EC] px-6 py-24 md:px-12 md:py-32"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        {/* Left rail */}
        <div data-reveal className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-700">
              Questions, Answered
            </span>
          </div>
          <h2 className="font-serif text-4xl font-normal leading-[1.15] tracking-wide text-[#13294B] md:text-5xl">
            Before You
            <br />
            <span className="italic font-light text-amber-600">Commission</span>
          </h2>
          <p className="mt-6 max-w-sm font-body text-sm leading-relaxed text-[#4A6285]">
            Everything Singapore clients ask us most — and anything else, the
            concierge answers within the day.
          </p>
          <a href="/contact" className="group mt-8 inline-flex items-center gap-3">
            <span className="btn-luxe-pill px-7 py-3 font-sans text-xs font-semibold uppercase tracking-[0.2em]">
              Ask the Concierge
            </span>
            <span className="btn-luxe-orb h-11 w-11">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7m0 0H9m8 0v8" />
              </svg>
            </span>
          </a>
        </div>

        {/* Accordion */}
        <div data-reveal-group className="divide-y divide-zinc-200 border-y border-zinc-200">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.question}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="group flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left md:py-7"
                >
                  <span
                    className={`font-serif text-lg tracking-wide transition-colors duration-300 md:text-xl ${
                      isOpen ? "text-amber-700" : "text-[#13294B] group-hover:text-amber-700"
                    }`}
                  >
                    {item.question}
                  </span>
                  <span
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      isOpen
                        ? "rotate-45 border-amber-600 text-amber-700"
                        : "border-zinc-300 text-[#5E7495] group-hover:border-amber-600 group-hover:text-amber-700"
                    }`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>
                <div
                  id={`faq-panel-${i}`}
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-7 font-body text-[0.9rem] leading-relaxed text-[#4A6285] md:text-sm">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
