import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Two rule sets rather than one.
 *
 * The general rule keeps crawlers out of the JSON endpoints and the back office
 * (both also send X-Robots-Tag: noindex from next.config.ts — robots.txt asks
 * politely, the header is what actually removes a page from an index).
 *
 * Campaign parameters (utm_, fbclid, gclid) are deliberately NOT disallowed.
 * Blocking them looks tidy but backfires: a crawler that cannot fetch
 * /shop?utm_source=… also cannot read the canonical tag on it, so the URL stays
 * in the index as an unconsolidated duplicate and any links pointing at it are
 * wasted. Every page emits a self-referencing canonical, which is the mechanism
 * actually designed for this.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/admin/"],
      },
      {
        // The image crawlers need the optimizer's output to index photography.
        userAgent: ["Googlebot-Image", "Bingbot"],
        allow: ["/", "/_next/image"],
        disallow: ["/api/", "/admin"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
