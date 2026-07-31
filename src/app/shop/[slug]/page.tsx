import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ScrollFX from "@/components/fx/ScrollFX";
import LuxeCursor from "@/components/fx/LuxeCursor";
import ProductGallery from "@/components/shop/ProductGallery";
import OrderForm from "@/components/shop/OrderForm";
import { getShopProduct, getShopProductSlugs } from "@/lib/shop-data";
import { productImageUrl } from "@/lib/supabase/env";
import { formatMoney } from "@/lib/shop";

export const revalidate = 60;

type PageParams = { params: Promise<{ slug: string }> };

/**
 * Prerender everything that is live at build time; anything published later is
 * rendered on first request and then cached like the rest (dynamicParams stays
 * on by default). Empty when Supabase isn't reachable during the build, which
 * simply means every piece renders on demand.
 */
export async function generateStaticParams() {
  const products = await getShopProductSlugs();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const product = await getShopProduct(slug);
  if (!product) return { title: "Piece not found" };

  const cover = productImageUrl(product.images[0]?.path);
  const description =
    product.description.slice(0, 200) ||
    `${product.title} — available to order from Ceylon Gem Maison.`;

  return {
    title: product.title,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title: product.title,
      description,
      type: "website",
      images: cover ? [{ url: cover }] : undefined,
    },
  };
}

const ASSURANCES = [
  "Hand-cut in the Colombo workshop, signed in the house ledger.",
  "Certification and papers travel with every piece.",
  "Insured shipping from Singapore; structural work guaranteed for life.",
];

export default async function ProductPage({ params }: PageParams) {
  const { slug } = await params;
  const product = await getShopProduct(slug);
  if (!product) notFound();

  const images = product.images
    .map((image) => ({ url: productImageUrl(image.path), alt: image.alt }))
    .filter((image): image is { url: string; alt: string | null } => Boolean(image.url));

  // Product structured data, generated from the same row the page renders.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || undefined,
    image: images.map((i) => i.url),
    brand: { "@type": "Brand", name: "Ceylon Gem Maison" },
    category: product.category?.name,
    ...(product.price != null && {
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: product.currency,
        availability: product.in_stock
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
      },
    }),
  };

  return (
    <main className="relative flex min-h-screen w-full select-none flex-col bg-[#F7F4EC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScrollFX />
      <LuxeCursor />

      {/* The navbar is fixed and out of flow, so this page clears it itself. */}
      <section className="w-full px-6 pb-16 pt-[calc(var(--nav-h)+3rem)] md:px-12 md:pb-24 md:pt-[calc(var(--nav-h)+4.5rem)]">
        <nav
          aria-label="Breadcrumb"
          className="mx-auto mb-10 flex max-w-7xl items-center gap-2 font-sans text-[0.66rem] uppercase tracking-[0.22em] text-[#5E7495]"
        >
          <Link href="/shop" className="transition-colors hover:text-[#13294B]">
            Shop
          </Link>
          {product.category && (
            <>
              <span aria-hidden>·</span>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="transition-colors hover:text-[#13294B]"
              >
                {product.category.name}
              </Link>
            </>
          )}
        </nav>

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
          {/* The piece */}
          <div data-reveal>
            <ProductGallery images={images} title={product.title} />
          </div>

          {/* The particulars */}
          <div data-reveal className="lg:pt-4">
            {product.category && (
              <span className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-700">
                {product.category.name}
              </span>
            )}
            <h1 className="mt-4 font-serif text-4xl font-normal leading-[1.12] tracking-wide text-[#13294B] md:text-5xl">
              {product.title}
            </h1>

            <p className="mt-5 font-serif text-2xl font-light tracking-wide text-amber-700">
              {formatMoney(product.price, product.currency)}
            </p>

            {product.description && (
              <p className="mt-6 max-w-xl whitespace-pre-wrap font-body text-[0.95rem] leading-relaxed text-[#4A6285] md:text-base">
                {product.description}
              </p>
            )}

            <ul className="mt-8 space-y-3 border-t border-zinc-200 pt-8">
              {ASSURANCES.map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 border border-amber-600/70 bg-amber-500/20" />
                  <span className="font-body text-[0.85rem] leading-relaxed text-[#4A6285]">
                    {line}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <OrderForm
                productId={product.id}
                productTitle={product.title}
                price={product.price}
                currency={product.currency}
                inStock={product.in_stock}
              />
            </div>

            <p className="mt-8 font-body text-[0.85rem] leading-relaxed text-[#4A6285]">
              Would you rather have it made to your own design?{" "}
              <Link href="/atelier" className="text-amber-700 underline underline-offset-4">
                Open the atelier
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <CTA />
      <Footer />
    </main>
  );
}
