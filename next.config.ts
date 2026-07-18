import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats — AVIF first (smallest), WebP fallback — instead of
    // the raw PNGs. The optimizer picks per request based on Accept headers.
    formats: ["image/avif", "image/webp"],
    // Optimized variants are content-hashed and immutable; cache them hard so
    // repeat views and the CDN edge never re-encode.
    minimumCacheTTL: 2_592_000, // 30 days
  },
};

export default nextConfig;
