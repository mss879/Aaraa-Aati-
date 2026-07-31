import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/articles";
import { PILLARS } from "@/lib/pillars";
import { getShopCategories, getShopProductSlugs } from "@/lib/shop-data";

// The shop half is read from Supabase, so the sitemap is async and refreshes on
// the same cadence as the storefront.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ceylongemmaison.com";
  const [categories, products] = await Promise.all([
    getShopCategories(),
    getShopProductSlugs(),
  ]);

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/atelier`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/collections`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/services`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/articles`, changeFrequency: "weekly", priority: 0.7 },
    // Shop category listings — one crawlable URL each.
    ...categories.map((category) => ({
      url: `${base}/shop?category=${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    // Every live piece.
    ...products.map((product) => ({
      url: `${base}/shop/${product.slug}`,
      lastModified: product.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    // SEO pillar guides — one per primary key phrase.
    ...PILLARS.map((pillar) => ({
      url: `${base}/${pillar.slug}`,
      lastModified: "2026-07-18",
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...ARTICLES.map((article) => ({
      url: `${base}/articles/${article.slug}`,
      lastModified: article.date,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
