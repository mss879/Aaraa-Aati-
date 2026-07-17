import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://ceylongemmaison.com";
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/atelier`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/collections`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/services`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/articles`, changeFrequency: "weekly", priority: 0.7 },
    ...ARTICLES.map((article) => ({
      url: `${base}/articles/${article.slug}`,
      lastModified: article.date,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
