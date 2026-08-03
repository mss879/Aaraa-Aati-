import type { Metadata } from "next";
import { FACEBOOK_URL, INSTAGRAM_URL, LINKEDIN_URL } from "@/lib/contact";

/**
 * One source of truth for the site's SEO surface.
 *
 * The reason this exists: Next only inherits `openGraph` as a whole block. A
 * page that sets `title`/`description` but no `openGraph` keeps the ROOT
 * openGraph — so every route was shipping the homepage's og:title, og:description
 * and og:url, and any share of /shop or /about rendered as the homepage. The
 * `pageMetadata()` helper below fills the social block from the same two strings
 * the page already declares, so the two can never drift apart again.
 */

/** Absolute site origin, no trailing slash. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.ceylongemmaison.com"
).replace(/\/+$/, "");

export const SITE_NAME = "Ceylon Gem Maison";
export const SITE_LOCALE = "en_SG";

/**
 * The share card. 1200×630 (the ratio Facebook, LinkedIn, WhatsApp and X all
 * crop to) and a real JPEG — the previous asset was JPEG bytes named `.png`,
 * which is served as `image/png` and is rejected by some scrapers outright.
 */
export const OG_IMAGE = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: "Cushion-cut Ceylon sapphire and diamond ring by Ceylon Gem Maison, on blue silk",
} as const;

/** Public profiles — doubles as schema.org `sameAs` for entity disambiguation. */
export const SOCIAL_PROFILES = [INSTAGRAM_URL, FACEBOOK_URL, LINKEDIN_URL];

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** The full document title, matching the root layout's `%s | Ceylon Gem Maison`. */
export function fullTitle(title?: string): string {
  if (!title) {
    return `${SITE_NAME} | Bespoke Ceylon Sapphire & Diamond Jewellery, Singapore`;
  }
  return `${title} | ${SITE_NAME}`;
}

type OgImage = { url: string; width?: number; height?: number; alt?: string };

type PageMetadataInput = {
  /** Page title WITHOUT the "| Ceylon Gem Maison" suffix. */
  title: string;
  description: string;
  /** Site-relative path, e.g. "/about". Used for both canonical and og:url. */
  path: string;
  /** Defaults to the house share card. */
  image?: OgImage;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  /** Set false for pages that should stay out of the index (legal boilerplate). */
  index?: boolean;
};

/**
 * Build a page's full metadata — canonical, Open Graph and Twitter card — from
 * the title/description it already declares. Every public route uses this.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = OG_IMAGE,
  type = "website",
  publishedTime,
  modifiedTime,
  keywords,
  index = true,
}: PageMetadataInput): Metadata {
  const resolved = fullTitle(title);
  const url = absoluteUrl(path);

  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: path },
    ...(index ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      title: resolved,
      description,
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type,
      images: [image],
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      ...(type === "article" && modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolved,
      description,
      images: [image.url],
    },
  };
}

/**
 * BreadcrumbList JSON-LD from an ordered trail. "Home" is prepended for you, so
 * pass only the crumbs below it — the same ones the page renders visually.
 */
export function breadcrumbJsonLd(
  crumbs: { name: string; path: string }[],
): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      ...crumbs.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      })),
    ],
  };
}
