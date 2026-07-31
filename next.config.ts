import type { NextConfig } from "next";

/**
 * Product photography lives in the public `product-images` Storage bucket, so
 * the optimizer has to be told that host is allowed. Both patterns are scoped to
 * the public object path — nothing else on the host can be proxied through it.
 * The wildcard covers any *.supabase.co project (including when the env var
 * isn't present at build time); the second entry adds the project's own host
 * when it sits on a custom domain.
 */
const supabaseHost = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return url ? new URL(url).hostname : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats — AVIF first (smallest), WebP fallback — instead of
    // the raw PNGs. The optimizer picks per request based on Accept headers.
    formats: ["image/avif", "image/webp"],
    // Optimized variants are content-hashed and immutable; cache them hard so
    // repeat views and the CDN edge never re-encode.
    minimumCacheTTL: 2_592_000, // 30 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      ...(supabaseHost && !supabaseHost.endsWith(".supabase.co")
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
