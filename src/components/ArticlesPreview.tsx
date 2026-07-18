import Image from "next/image";
import Link from "next/link";
import { ARTICLES } from "@/lib/articles";

/**
 * ArticlesPreview
 * Homepage band, directly after the FAQ: the three latest journal pieces as
 * visual cards linking into /articles.
 */
export default function ArticlesPreview() {
  return (
    <section className="w-full select-none border-t border-zinc-200 bg-[#F7F4EC] px-6 py-24 md:px-12 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="mb-12 flex flex-col items-start justify-between gap-8 md:mb-16 md:flex-row md:items-end">
          <div>
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-700">
                The Journal
              </span>
            </div>
            <h2 className="font-serif text-4xl font-normal leading-[1.15] tracking-wide text-[#13294B] md:text-5xl">
              Notes From
              <br />
              <span className="italic font-light text-amber-600">the Atelier</span>
            </h2>
          </div>
          <Link href="/articles" className="group inline-flex items-center gap-3">
            <span className="btn-luxe-pill px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.2em]">
              Read the Journal
            </span>
            <span className="btn-luxe-orb h-12 w-12">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7m0 0H9m8 0v8" />
              </svg>
            </span>
          </Link>
        </div>

        <div data-reveal-group className="grid gap-8 md:grid-cols-3">
          {ARTICLES.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-500/40 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={article.heroImage}
                  alt={article.heroAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[1600ms] group-hover:scale-105"
                />
                <span className="chip-luxe absolute left-4 top-4">
                  {article.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-7">
                <div className="mb-3 flex items-center gap-3 font-sans text-[0.68rem] uppercase tracking-[0.18em] text-[#5E7495]">
                  <time dateTime={article.date}>{article.displayDate}</time>
                  <span className="h-1 w-1 rounded-full bg-amber-500/60" />
                  <span>{article.readTime}</span>
                </div>
                <h3 className="font-serif text-xl font-normal leading-snug tracking-wide text-[#13294B] transition-colors duration-300 group-hover:text-amber-700 md:text-[1.35rem]">
                  {article.title}
                </h3>
                <p className="mt-3 line-clamp-3 font-body text-[0.85rem] leading-relaxed text-[#4A6285]">
                  {article.description}
                </p>
                <span className="mt-auto flex items-center gap-2 pt-6 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-amber-700">
                  Read Article
                  <svg
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
