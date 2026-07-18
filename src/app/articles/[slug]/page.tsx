import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollFX from "@/components/fx/ScrollFX";
import LuxeCursor from "@/components/fx/LuxeCursor";
import { ARTICLES, getArticle } from "@/lib/articles";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.seoTitle,
    description: article.description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      title: article.seoTitle,
      description: article.description,
      type: "article",
      publishedTime: article.date,
      images: [{ url: article.heroImage }],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 2);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ceylongemmaison.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: `${base}${article.heroImage}`,
    datePublished: article.date,
    author: { "@type": "Organization", name: "Ceylon Gem Maison", url: base },
    publisher: {
      "@type": "Organization",
      name: "Ceylon Gem Maison",
      logo: { "@type": "ImageObject", url: `${base}/logo.jpeg` },
    },
    mainEntityOfPage: `${base}/articles/${article.slug}`,
  };

  return (
    <main className="relative flex min-h-screen w-full select-none flex-col bg-[#F7F4EC]">
      <ScrollFX />
      <LuxeCursor />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Article hero */}
      <section className="relative z-10 w-full">
        <div className="relative flex min-h-[72svh] w-full flex-col overflow-hidden bg-[#0A1F3D] md:min-h-[78svh]">
          <div className="absolute inset-0 z-0">
            <Image
              src={article.heroImage}
              alt={article.heroAlt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/35 to-black/85" />
          <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.72)_100%)]" />

          <div className="relative z-40">
            <Navbar />
          </div>

          <div className="relative z-30 flex flex-1 items-end px-6 pb-14 pt-44 md:px-16 md:pb-20">
            <div data-reveal className="max-w-3xl">
              <div className="mb-5 flex flex-wrap items-center gap-3 font-sans text-[0.68rem] uppercase tracking-[0.25em] text-gold-200">
                <Link href="/articles" className="transition-colors hover:text-gold-300">
                  The Journal
                </Link>
                <span className="h-1 w-1 rounded-full bg-gold-400/60" />
                <span>{article.category}</span>
                <span className="h-1 w-1 rounded-full bg-gold-400/60" />
                <time dateTime={article.date}>{article.displayDate}</time>
                <span className="h-1 w-1 rounded-full bg-gold-400/60" />
                <span>{article.readTime}</span>
              </div>
              <h1 className="font-serif text-[2.4rem] font-light leading-[1.08] tracking-wide text-gold-50 md:text-5xl lg:text-6xl">
                {article.title}
              </h1>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-30 h-[2px] bg-gradient-to-r from-transparent via-gold-400/60 to-transparent" />
        </div>
      </section>

      {/* White island: article body */}
      <div className="relative z-20 flex w-full flex-col bg-[#F7F4EC]">
        <article className="w-full px-6 py-20 md:px-12 md:py-28">
          <div className="mx-auto max-w-3xl">
            {/* Intro */}
            <div data-reveal className="space-y-6 border-l-2 border-amber-600/50 pl-6 md:pl-8">
              {article.intro.map((para) => (
                <p key={para.slice(0, 32)} className="font-serif text-xl font-light leading-relaxed text-[#2C405C] md:text-2xl">
                  {para}
                </p>
              ))}
            </div>

            {/* Sections */}
            <div className="mt-16 space-y-14 md:space-y-16">
              {article.sections.map((section, i) => (
                <section key={section.heading} data-reveal>
                  <div className="mb-5 flex items-baseline gap-4">
                    <span className="font-serif text-2xl font-light text-amber-600/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-serif text-2xl font-normal leading-snug tracking-wide text-[#13294B] md:text-3xl">
                      {section.heading}
                    </h2>
                  </div>
                  <div className="space-y-5">
                    {section.paragraphs.map((para) => (
                      <p key={para.slice(0, 32)} className="font-body text-[0.95rem] leading-[1.85] text-[#3A4E6B] md:text-base">
                        {para}
                      </p>
                    ))}
                  </div>
                  {section.list && (
                    <ul className="mt-6 space-y-3.5">
                      {section.list.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-2 h-2 w-2 flex-shrink-0 rotate-45 bg-amber-600" />
                          <span className="font-body text-[0.9rem] leading-relaxed text-[#3A4E6B]">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            {/* Closing */}
            <div data-reveal className="mt-16 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 md:p-10">
              <p className="font-serif text-lg font-light italic leading-relaxed text-[#2C405C] md:text-xl">
                {article.closing}
              </p>
            </div>

            {/* CTA */}
            <div data-reveal className="mt-14 flex flex-col items-start gap-4 border-t border-zinc-200 pt-10 sm:flex-row sm:items-center">
              <Link
                href="/atelier"
                className="rounded-full bg-[#12305B] px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#F7F4EC] transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-700"
              >
                Design Your Own Ring
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-zinc-300 px-8 py-3.5 font-sans text-xs font-medium uppercase tracking-[0.2em] text-[#2C405C] transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-600 hover:text-amber-700"
              >
                Ask a Gemologist
              </Link>
            </div>
          </div>
        </article>

        {/* Related */}
        <section className="w-full border-t border-zinc-200 bg-[#F7F4EC] px-6 py-20 md:px-12 md:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 data-reveal className="mb-10 font-serif text-3xl font-normal tracking-wide text-[#13294B] md:text-4xl">
              Continue <span className="italic font-light text-amber-600">Reading</span>
            </h2>
            <div data-reveal-group className="grid gap-8 md:grid-cols-2">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/articles/${rel.slug}`}
                  className="group flex items-center gap-6 rounded-2xl border border-zinc-200 bg-[#F7F4EC] p-5 transition-all duration-500 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)]"
                >
                  <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={rel.heroImage}
                      alt={rel.heroAlt}
                      fill
                      sizes="8rem"
                      className="object-cover transition-transform duration-[1400ms] group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <span className="font-sans text-[0.62rem] font-medium uppercase tracking-[0.2em] text-amber-700">
                      {rel.category}
                    </span>
                    <h3 className="mt-1.5 font-serif text-lg font-normal leading-snug tracking-wide text-[#13294B] transition-colors duration-300 group-hover:text-amber-700">
                      {rel.title}
                    </h3>
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
