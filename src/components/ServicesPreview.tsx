import Link from "next/link";
import { SERVICES } from "@/lib/services";

/**
 * ServicesPreview
 * Homepage band: service names only — an index, not an essay. Each row links
 * into the full /services page where every service is elaborated.
 */
export default function ServicesPreview() {
  return (
    <section className="relative w-full select-none border-t border-zinc-200 bg-[#F7F4EC] px-6 py-28 md:px-12 md:py-36">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute right-1/4 top-1/4 h-96 w-96 rounded-full bg-gold-500/5 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div data-reveal className="mb-14 flex flex-col items-start justify-between gap-8 md:mb-20 md:flex-row md:items-end">
          <div>
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-700">
                At Your Service
              </span>
            </div>
            <h2 className="font-serif text-4xl font-normal leading-[1.15] tracking-wide text-[#13294B] md:text-5xl">
              The Maison,
              <br />
              <span className="italic font-light text-amber-600">However You Need It</span>
            </h2>
          </div>
          <Link href="/services" className="group inline-flex items-center gap-3">
            <span className="btn-luxe-pill px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.2em]">
              Explore All Services
            </span>
            <span className="btn-luxe-orb h-12 w-12">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7m0 0H9m8 0v8" />
              </svg>
            </span>
          </Link>
        </div>

        {/* Name-only index rows */}
        <div data-reveal-group className="border-t border-zinc-200">
          {SERVICES.map((service, i) => (
            <Link
              key={service.slug}
              href={`/services#${service.slug}`}
              className="group flex items-center justify-between gap-6 border-b border-zinc-200 py-6 transition-colors duration-300 hover:border-amber-500/40 md:py-7"
            >
              <div className="flex items-baseline gap-5 md:gap-8">
                <span className="font-serif text-sm font-light text-[#8FA5C6] transition-colors duration-300 group-hover:text-amber-600 md:text-base">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-serif text-xl font-light tracking-wide text-[#1E3560] transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-amber-700 md:text-3xl">
                  {service.name}
                </span>
              </div>
              <span className="hidden flex-shrink-0 items-center gap-3 sm:flex">
                <span className="font-sans text-[0.68rem] uppercase tracking-[0.2em] text-[#8FA5C6] opacity-0 transition-all duration-300 group-hover:text-amber-600 group-hover:opacity-100">
                  {service.tagline}
                </span>
                <span className="btn-luxe-orb h-10 w-10 text-[#8FA5C6]">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7m0 0H9m8 0v8" />
                  </svg>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
