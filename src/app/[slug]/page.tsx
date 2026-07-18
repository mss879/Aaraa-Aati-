import type { Metadata } from "next";
import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PILLARS, getPillar, type PillarSection } from "@/lib/pillars";

/**
 * SEO pillar pages — one statically prerendered page per primary key phrase.
 *
 * Deliberately rendered as pure server components with NO client animation
 * layer (no ScrollFX/LuxeCursor, no data-reveal attributes, no preloader —
 * that is gated to the home route): Googlebot sees the complete, unobscured
 * HTML exactly as served. Each page targets exactly one phrase; angles and
 * cross-links are designed in src/lib/pillars.ts to avoid cannibalization.
 */

type Props = { params: Promise<{ slug: string }> };

// Only the defined pillar slugs are valid routes; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return PILLARS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pillar = getPillar(slug);
  if (!pillar) return {};
  return {
    title: pillar.title,
    description: pillar.description,
    alternates: { canonical: `/${pillar.slug}` },
    openGraph: {
      title: pillar.title,
      description: pillar.description,
      type: "article",
      url: `/${pillar.slug}`,
      images: [{ url: pillar.image.src }],
    },
  };
}

/** Render a paragraph string, converting [label](/path) into real links. */
function rich(text: string): React.ReactNode[] {
  return text.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) {
      return (
        <Link
          key={i}
          href={m[2]}
          className="text-amber-700 underline decoration-amber-400/40 underline-offset-4 transition-colors hover:text-amber-600 hover:decoration-amber-500"
        >
          {m[1]}
        </Link>
      );
    }
    return part;
  });
}

function Section({ section }: { section: PillarSection }) {
  return (
    <section id={section.id} className="scroll-mt-28">
      <h2 className="font-serif text-2xl font-normal leading-snug tracking-wide text-[#13294B] md:text-[2rem]">
        {section.heading}
      </h2>
      <div className="mt-5 space-y-5">
        {section.paragraphs?.map((p, i) => (
          <p key={i} className="font-body text-base leading-relaxed text-[#3A4E6B] md:text-lg">
            {rich(p)}
          </p>
        ))}
        {section.list && (
          <ul className="space-y-3.5">
            {section.list.map((item, i) => (
              <li key={i} className="flex gap-3 font-body text-base leading-relaxed text-[#3A4E6B] md:text-lg">
                <span aria-hidden className="mt-[0.72em] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>{rich(item)}</span>
              </li>
            ))}
          </ul>
        )}
        {section.table && (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white/70">
            <table className="w-full min-w-[480px] border-collapse text-left">
              {section.table.caption && (
                <caption className="px-5 pt-4 pb-2 text-left font-sans text-[0.7rem] uppercase tracking-[0.18em] text-amber-700">
                  {section.table.caption}
                </caption>
              )}
              <thead>
                <tr className="border-b border-zinc-200">
                  {section.table.headers.map((h) => (
                    <th key={h} className="px-5 py-3 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[#13294B]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.table.rows.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-100 last:border-0">
                    {row.map((cell, j) => (
                      <td key={j} className="px-5 py-3.5 font-body text-[0.95rem] leading-snug text-[#3A4E6B]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {section.paragraphsAfter?.map((p, i) => (
          <p key={i} className="font-body text-base leading-relaxed text-[#3A4E6B] md:text-lg">
            {rich(p)}
          </p>
        ))}
      </div>
    </section>
  );
}

export default async function PillarPage({ params }: Props) {
  const { slug } = await params;
  const pillar = getPillar(slug);
  if (!pillar) notFound();

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ceylongemmaison.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${base}/${pillar.slug}#webpage`,
        url: `${base}/${pillar.slug}`,
        name: pillar.title,
        description: pillar.description,
        isPartOf: { "@id": `${base}/#website` },
        about: { "@id": `${base}/#organization` },
        inLanguage: "en-SG",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: pillar.h1Top,
            item: `${base}/${pillar.slug}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: pillar.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col bg-[#F7F4EC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navy editorial hero — text-first for instant LCP, nothing overlaid */}
      <section className="relative z-10 w-full">
        <div className="relative w-full overflow-hidden bg-[#0A1F3D]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(46,91,224,0.28),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(191,155,67,0.16),transparent_50%)]"
          />
          <div className="relative z-40">
            <Navbar />
          </div>

          <div className="relative z-30 mx-auto w-full max-w-5xl px-6 pb-16 pt-40 md:px-10 md:pb-24 md:pt-48">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-3 font-sans text-[0.68rem] uppercase tracking-[0.25em] text-gold-200">
              <Link href="/" className="transition-colors hover:text-gold-300">
                Home
              </Link>
              <span aria-hidden className="h-1 w-1 rounded-full bg-gold-400/60" />
              <span>{pillar.eyebrow}</span>
            </nav>

            <h1 className="font-serif text-[2.35rem] font-light leading-[1.08] tracking-wide text-gold-50 md:text-5xl lg:text-[3.6rem]">
              {pillar.h1Top}
              <br />
              <span className="italic text-gold-200">{pillar.h1Accent}</span>
            </h1>
            <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-[#C7D3E8] md:text-lg">
              {pillar.subtitle}
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/atelier"
                className="btn-luxe-pill inline-flex items-center justify-center px-8 py-3.5 text-center font-sans text-xs font-semibold uppercase tracking-[0.2em]"
              >
                Design Yours — Instant Quote
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-gold-400/30 px-8 py-3.5 text-center font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold-300/60 hover:bg-gold-500/10"
              >
                Book a Consultation
              </Link>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-30 h-[2px] bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
        </div>
      </section>

      {/* Body */}
      <div className="relative z-20 w-full">
        <div className="mx-auto w-full max-w-5xl px-6 py-14 md:px-10 md:py-20">
          {/* Intro */}
          <div className="space-y-5">
            {pillar.intro.map((p, i) => (
              <p key={i} className="font-body text-lg leading-relaxed text-[#2C3E5C] md:text-xl">
                {rich(p)}
              </p>
            ))}
          </div>

          {/* In-page contents */}
          <nav
            aria-label="On this page"
            className="mt-10 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 md:p-8"
          >
            <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-amber-700">
              In this guide
            </p>
            <ol className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {pillar.sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="group inline-flex items-baseline gap-2.5 font-body text-[0.95rem] text-[#3A4E6B] transition-colors hover:text-amber-700"
                  >
                    <span className="font-sans text-[0.68rem] tabular-nums tracking-widest text-amber-600/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="underline-offset-4 group-hover:underline">{s.heading}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* First half of sections */}
          <div className="mt-14 space-y-14 md:mt-16 md:space-y-16">
            {pillar.sections.slice(0, 3).map((s) => (
              <Section key={s.id} section={s} />
            ))}
          </div>

          {/* Image band */}
          <figure className="mt-14 overflow-hidden rounded-2xl md:mt-16">
            <div className="relative aspect-[16/9] w-full bg-[#0A1F3D]">
              <Image
                src={pillar.image.src}
                alt={pillar.image.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 960px"
                className="object-cover"
              />
            </div>
            <figcaption className="px-1 pt-3 font-sans text-[0.68rem] uppercase tracking-[0.22em] text-[#5E7495]">
              {pillar.image.alt}
            </figcaption>
          </figure>

          {/* Remaining sections */}
          <div className="mt-14 space-y-14 md:mt-16 md:space-y-16">
            {pillar.sections.slice(3).map((s) => (
              <Section key={s.id} section={s} />
            ))}
          </div>

          {/* FAQ — visible content backing the FAQPage structured data */}
          <section id="faq" className="mt-16 scroll-mt-28 md:mt-20">
            <h2 className="font-serif text-2xl font-normal leading-snug tracking-wide text-[#13294B] md:text-[2rem]">
              Frequently asked questions
            </h2>
            <div className="mt-6 divide-y divide-zinc-200 border-y border-zinc-200">
              {pillar.faqs.map((f, i) => (
                <details key={i} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 font-serif text-lg leading-snug text-[#13294B] md:text-xl [&::-webkit-details-marker]:hidden">
                    <span>{f.q}</span>
                    <span
                      aria-hidden
                      className="shrink-0 font-sans text-amber-600 transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-3xl font-body text-base leading-relaxed text-[#3A4E6B] md:text-[1.05rem]">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Related guides — descriptive cross-links keep each page in its lane */}
          <section className="mt-16 md:mt-20">
            <h2 className="font-serif text-2xl font-normal leading-snug tracking-wide text-[#13294B] md:text-[2rem]">
              Continue reading
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pillar.related.map((r) => {
                const target = getPillar(r.slug);
                if (!target) return null;
                return (
                  <Link
                    key={r.slug}
                    href={`/${r.slug}`}
                    className="group rounded-2xl border border-zinc-200 bg-white/70 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-[0_12px_40px_rgba(19,41,75,0.08)]"
                  >
                    <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-amber-700">
                      {r.label}
                    </p>
                    <p className="mt-2.5 font-serif text-lg leading-snug text-[#13294B]">
                      {target.h1Top} {target.h1Accent}
                    </p>
                    <p className="mt-2 font-body text-sm leading-relaxed text-[#5E7495]">
                      {r.blurb}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        {/* Closing CTA band */}
        <section className="w-full bg-[#0A1F3D]">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-7 px-6 py-16 md:flex-row md:items-center md:justify-between md:px-10 md:py-20">
            <div className="max-w-xl">
              <h2 className="font-serif text-3xl font-light leading-tight tracking-wide text-gold-50 md:text-4xl">
                {pillar.ctaHeading}
              </h2>
              <p className="mt-4 font-body text-base leading-relaxed text-[#C7D3E8] md:text-lg">
                {pillar.ctaBody}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-4 sm:flex-row">
              <Link
                href="/atelier"
                className="btn-luxe-pill inline-flex items-center justify-center px-8 py-3.5 text-center font-sans text-xs font-semibold uppercase tracking-[0.2em]"
              >
                Open the Atelier
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-gold-400/30 px-8 py-3.5 text-center font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold-200 transition-all duration-300 hover:border-gold-300/60 hover:bg-gold-500/10"
              >
                Speak With Us
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
