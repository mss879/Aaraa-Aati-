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

/**
 * Security headers applied to every response.
 *
 * On the deliberately-missing Content-Security-Policy `script-src`: locking
 * scripts down properly needs a per-request nonce, which means running the
 * proxy on every route — and a proxy that touches every route opts the whole
 * site out of static generation. Trading every prerendered page for a directive
 * that would still need `'unsafe-inline'` (React streams inline hydration
 * payloads) is a bad deal, so the CSP below carries only the directives that
 * are both nonce-free and genuinely useful: nothing may frame this site, inject
 * a <base> tag, post a form off-site, or load a plugin/object.
 */
const SECURITY_HEADERS = [
  // Belt and braces with frame-ancestors, for older browsers.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stop browsers guessing a type other than the one we declared — this is what
  // turns a mislabelled upload into a script execution.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the origin cross-site (so referral analytics still work) but never the
  // full path — atelier URLs can carry a client's design in the query string.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing here needs these; deny them by default rather than on request.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()",
  },
  // Two years, subdomains included, preload-eligible. HTTPS only in practice —
  // browsers ignore it over plain HTTP, so local dev is unaffected.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework and its version to scanners.
  poweredByHeader: false,
  // Trailing-slash URLs 308 to the canonical form; keep one spelling per page.
  trailingSlash: false,

  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      {
        // The admin back office must never be cached by a shared proxy, and
        // must never appear in an index even if a link leaks.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
      {
        // Same for the JSON endpoints — they're same-origin only and their
        // responses are per-visitor.
        source: "/api/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        /**
         * Raw art served straight out of /public — hero stills, the share card,
         * the logo. Deliberately NOT `immutable`: these filenames are fixed, not
         * content-hashed, so a one-year immutable policy would mean replacing a
         * product photo under its existing name leaves every past visitor (and
         * the CDN edge) on the old picture for a year with no way to bust it.
         * A day fresh, then a week of serving stale while revalidating in the
         * background: repeat views are still free, and a swapped file rolls out
         * within a day. Hashed build assets under /_next/static are separate —
         * Next already marks those immutable, correctly.
         */
        source: "/:file*.:ext(jpg|jpeg|png|webp|avif|svg|ico|mp4|webm)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },

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
