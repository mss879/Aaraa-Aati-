import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ScrollFX from "@/components/fx/ScrollFX";
import LuxeCursor from "@/components/fx/LuxeCursor";
import { getShopCategories, getShopProducts } from "@/lib/shop-data";
import { productImageUrl } from "@/lib/supabase/env";
import { formatMoney } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Shop the Maison",
  description:
    "Ceylon Gem Maison pieces available to order now — rings, earrings and bracelets in hand-cut Ceylon stones and 18k gold, shipped from Singapore.",
  alternates: { canonical: "/shop" },
};

// The catalogue changes when the admin publishes, not per visitor.
export const revalidate = 60;

/**
 * /shop — the ready-to-order half of the house.
 *
 * Filtering is done with links rather than client state, so the whole page
 * stays a Server Component and every category is its own crawlable URL
 * (/shop?category=rings). "Shop All" is the unfiltered page.
 */
export default async function ShopPage({
  searchParams,
}: {
  // Next 16: searchParams is a Promise.
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, products] = await Promise.all([
    getShopCategories(),
    getShopProducts(category ?? null),
  ]);

  const activeCategory = categories.find((c) => c.slug === category) ?? null;
  const heroImage = activeCategory?.image_url?.startsWith("/")
    ? activeCategory.image_url
    : "/ring_model.png";

  return (
    <main className="relative flex min-h-screen w-full select-none flex-col bg-[#F7F4EC]">
      <ScrollFX />
      <LuxeCursor />

      <PageHero
        eyebrow="The Maison Shop"
        title={activeCategory ? activeCategory.name : "Pieces Ready"}
        titleAccent={activeCategory ? "In the House" : "To Be Worn"}
        body={
          activeCategory?.description ??
          "The finished pieces currently in the house — hand-cut Ceylon stones set in 18k gold, ready to order and shipped from Singapore. Anything you don't see here, we make."
        }
        image={{ src: heroImage, position: "center 22%" }}
      />

      <div className="relative z-20 flex w-full flex-col bg-[#F7F4EC]">
        {/* ---- Filter bar ---- */}
        <section className="w-full px-6 pb-12 pt-24 md:px-12 md:pb-16 md:pt-32">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div data-reveal>
              <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-700">
                Available Now
              </span>
              <h2 className="mt-4 font-serif text-4xl font-normal leading-[1.15] tracking-wide text-[#13294B] md:text-5xl">
                Shop the
                <span className="italic font-light text-amber-600"> Maison</span>
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/shop"
                aria-current={!activeCategory ? "page" : undefined}
                className={`rounded-full border px-5 py-2 font-sans text-[0.7rem] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${
                  !activeCategory
                    ? "border-[#1D3D6B] bg-[#12305B] text-[#F7F4EC]"
                    : "border-zinc-300 text-[#4A6285] hover:border-[#1D3D6B] hover:text-[#13294B]"
                }`}
              >
                Shop All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?category=${c.slug}`}
                  aria-current={activeCategory?.id === c.id ? "page" : undefined}
                  className={`rounded-full border px-5 py-2 font-sans text-[0.7rem] font-medium uppercase tracking-[0.2em] transition-all duration-300 ${
                    activeCategory?.id === c.id
                      ? "border-[#1D3D6B] bg-[#12305B] text-[#F7F4EC]"
                      : "border-zinc-300 text-[#4A6285] hover:border-[#1D3D6B] hover:text-[#13294B]"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-7xl font-sans text-[0.7rem] uppercase tracking-[0.25em] text-[#5E7495]">
            {products.length} {products.length === 1 ? "piece" : "pieces"}
            {activeCategory && ` · ${activeCategory.name}`}
          </p>
        </section>

        {/* ---- Grid ---- */}
        {products.length === 0 ? (
          <section className="w-full px-6 pb-24 md:px-12">
            <div className="mx-auto max-w-3xl border-y border-zinc-200 py-20 text-center">
              <h3 className="font-serif text-2xl font-normal tracking-wide text-[#13294B] md:text-3xl">
                Nothing in this case just now
              </h3>
              <p className="mx-auto mt-4 max-w-lg font-body text-sm leading-relaxed text-[#4A6285] md:text-base">
                The maison sells in small numbers, and pieces leave quickly. Tell our concierge what
                you are looking for, or have it made to your own design.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/contact" className="btn-luxe-pill">
                  Speak to the Concierge
                </Link>
                <Link href="/atelier" className="btn-platinum">
                  Design Your Own
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-[1px] border-y border-[#1D3D6B] bg-[#12305B] sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const cover = productImageUrl(product.images[0]?.path);
              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden bg-black p-6 md:p-7"
                >
                  {/* Category label */}
                  <span className="relative z-10 font-sans text-[0.7rem] font-medium uppercase tracking-[0.25em] text-[#A9B8D0]">
                    {product.category?.name ?? "The Maison"}
                  </span>

                  <div className="relative z-10 my-3 min-h-0 w-full flex-1">
                    <div className="relative h-full w-full transition-transform duration-500 group-hover:scale-105">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={product.title}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center font-sans text-[0.65rem] uppercase tracking-[0.2em] text-[#5E7495]">
                          Photograph coming
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10 space-y-3">
                    <h3 className="font-serif text-lg tracking-wide text-white transition-colors group-hover:text-gold-300 md:text-xl">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between border-t border-[#1D3D6B] pt-4">
                      <span className="font-sans text-[0.7rem] uppercase tracking-[0.2em] text-gold-300/90">
                        {product.in_stock
                          ? formatMoney(product.price, product.currency)
                          : "Reserved"}
                      </span>
                      <span className="inline-flex items-center gap-2 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#A9B8D0] transition-colors group-hover:text-white">
                        View
                        <svg
                          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l9-9m0 0H9m8 0v8" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <CTA />
        <Footer />
      </div>
    </main>
  );
}
