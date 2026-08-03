import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

/**
 * Web app manifest. Not a PWA — there is no service worker and nothing here is
 * offline-capable. It exists so that a visitor who adds the maison to their
 * home screen gets the house name and colours instead of a screenshot and a
 * truncated URL, and so Lighthouse's installability checks stop flagging it.
 *
 * The icons are the same files the metadata layer already generates from
 * src/app/icon.png and src/app/apple-icon.png.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Bespoke Ceylon Sapphire & Diamond Jewellery`,
    short_name: SITE_NAME,
    description:
      "Bespoke Ceylon sapphire engagement rings and fine jewellery for Singapore — ethically sourced at origin, cut by hand, and delivered fully insured.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F7F4EC",
    theme_color: "#0A1F3D",
    lang: "en-SG",
    dir: "ltr",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
