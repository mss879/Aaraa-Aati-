import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Footer from "@/components/Footer";
import ScrollFX from "@/components/fx/ScrollFX";
import LuxeCursor from "@/components/fx/LuxeCursor";
import { ARTICLES } from "@/lib/articles";

export const metadata: Metadata = {
  title: "The Journal — Sapphire & Jewellery Guides for Singapore",
  description:
    "Guides and stories from the Ceylon Gem Maison atelier: choosing a Ceylon sapphire engagement ring in Singapore, sapphires versus diamonds, and the journey of an ethically sourced gem.",
  alternates: { canonical: "/articles" },
};

export default function ArticlesPage() {
  const [featured, ...rest] = ARTICLES;

  return (
    <main className="relative flex min-h-screen w-full select-none flex-col bg-[#F7F4EC]">
      <ScrollFX />
      <LuxeCursor />

      <PageHero
        eyebrow="The Maison Journal"
        title="Notes From"
        titleAccent="the Atelier"
        body="Buying guides, provenance stories and honest gemologist advice — written at the bench, for clients in Singapore and beyond."
        image={{ src: "/necklace_celest.png", position: "center 30%" }}
      />

      {/* White island */}
      <div className="relative z-20 flex w-full flex-col bg-[#F7F4EC]">
        <section className="w-full px-6 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-7xl space-y-16">
            {/* Featured article */}
            <Link
              data-reveal
              href={`/articles/${featured.slug}`}
              className="group grid overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-500/40 hover:shadow-[0_24px_60px_rgba(0,0,0,0.1)] lg:grid-cols-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[420px]">
                <Image
                  src={featured.heroImage}
                  alt={featured.heroAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1600ms] group-hover:scale-105"
                />
                <span className="absolute left-5 top-5 rounded-full bg-black/60 px-3.5 py-1.5 font-sans text-[0.62rem] font-medium uppercase tracking-[0.2em] text-gold-200 backdrop-blur-sm">
                  Featured · {featured.category}
                </span>
              </div>
              <div className="flex flex-col justify-center p-8 md:p-12">
                <div className="mb-4 flex items-center gap-3 font-sans text-[0.68rem] uppercase tracking-[0.18em] text-[#5E7495]">
                  <time dateTime={featured.date}>{featured.displayDate}</time>
                  <span className="h-1 w-1 rounded-full bg-amber-500/60" />
                  <span>{featured.readTime}</span>
                </div>
                <h2 className="font-serif text-3xl font-normal leading-snug tracking-wide text-[#13294B] transition-colors duration-300 group-hover:text-amber-700 md:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-5 max-w-xl font-body text-sm leading-relaxed text-[#4A6285] md:text-base">
                  {featured.description}
                </p>
                <span className="mt-8 flex items-center gap-2 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-amber-700">
                  Read Article
                  <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Remaining articles */}
            <div data-reveal-group className="grid gap-8 md:grid-cols-2">
              {rest.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-500/40 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)]"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={article.heroImage}
                      alt={article.heroAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-[1600ms] group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3.5 py-1.5 font-sans text-[0.62rem] font-medium uppercase tracking-[0.2em] text-gold-200 backdrop-blur-sm">
                      {article.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-8">
                    <div className="mb-3 flex items-center gap-3 font-sans text-[0.68rem] uppercase tracking-[0.18em] text-[#5E7495]">
                      <time dateTime={article.date}>{article.displayDate}</time>
                      <span className="h-1 w-1 rounded-full bg-amber-500/60" />
                      <span>{article.readTime}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-normal leading-snug tracking-wide text-[#13294B] transition-colors duration-300 group-hover:text-amber-700">
                      {article.title}
                    </h3>
                    <p className="mt-3 font-body text-[0.88rem] leading-relaxed text-[#4A6285]">
                      {article.description}
                    </p>
                    <span className="mt-auto flex items-center gap-2 pt-6 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-amber-700">
                      Read Article
                      <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
