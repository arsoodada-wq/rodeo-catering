import type { NextConfig } from "next";

const securityHeaders = [
  // Blocks this site (including /admin/login) from being framed by another
  // origin — the standard defense against clickjacking / UI-redress attacks.
  { key: "X-Frame-Options", value: "DENY" },
  // Stops browsers from MIME-sniffing a response away from its declared
  // Content-Type (e.g. treating an uploaded file as executable script).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Sends only the origin (not the full URL/path) as a Referer header to
  // other sites, and nothing at all on a downgrade to plain HTTP.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disables a handful of sensitive browser APIs this site never uses.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Ignored by browsers over plain HTTP, so harmless in local dev; once the
  // production domain is live over HTTPS this tells browsers to never try
  // HTTP for it again, even on a typed-in "http://" URL.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

/**
 * Audited every resource this app's public pages actually load in the
 * browser before writing this (Phase 10 had deliberately skipped a CSP
 * until that audit was done — see PROJECT_STATUS.md): no next/image remote
 * domains configured, no third-party <script>/<link> tags, no
 * analytics/pixel scripts (the GA/Meta/TikTok env vars in .env.example are
 * unused placeholders — see the Phase 12 notes), Poppins is self-hosted by
 * next/font (no fonts.googleapis.com request at runtime), and the only
 * client-side fetch() calls (ConciergeChat, every admin form) hit this
 * same origin. `script-src`/`style-src` keep `'unsafe-inline'` here rather
 * than a nonce: Next.js's own hydration/bootstrap scripts, this app's two
 * JSON-LD <script> tags (LocalBusinessSchema, the blog post's BlogPosting
 * schema), and a few components' inline `style={{}}` attributes (Hero,
 * FinalCta, global-error) all need it. Threading a nonce through here
 * instead requires calling `headers()` somewhere every public page
 * renders (LocalBusinessSchema sits in the shared site layout) — tried
 * that, and it silently opts every public marketing page out of static
 * generation (confirmed via a real `next build`: ~15 pages flipped from
 * prerendered to server-rendered-per-request). That's a real cost — slower
 * page loads and full server-side work on every visit, worse for SEO —
 * for defense-in-depth against a script-injection class this app's Phase
 * 10 audit found no actual vector for. The admin dashboard is a better
 * trade: see src/proxy.ts, which gives `/admin/*` its own nonce-based,
 * fully `'unsafe-inline'`-free policy — those routes were already
 * server-rendered per-request for auth anyway, so nothing is given up
 * there, and it's the more valuable surface to harden (session cookies,
 * every mutating action) if a script-injection bug ever did appear.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

// Applied in production only: next dev's Turbopack HMR client opens its own
// WebSocket back to the dev server, which a strict connect-src would block
// mid-development for no real security benefit (localhost isn't the threat
// model this header defends against).
const productionOnlyHeaders =
  process.env.NODE_ENV === "production"
    ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }]
    : [];

// src/proxy.ts sets its own stricter, nonce-based Content-Security-Policy
// for /admin/* — excluded from the CSP header here (via the custom-regex
// path below) rather than just trusting one to override the other, so
// there's no ambiguity about which policy an admin response actually gets.
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Next.js rejects a route entry with an empty `headers` array, so
      // this is only added at all once there's an actual header for it —
      // in dev, productionOnlyHeaders is empty and this block is skipped.
      ...(productionOnlyHeaders.length > 0
        ? [{ source: "/:path((?!admin).*)", headers: productionOnlyHeaders }]
        : []),
    ];
  },
  // Default Server Action body limit (1MB) is too small for an image
  // upload — the media library (src/app/actions/media.ts) rejects files
  // over 4MB itself; this just needs enough headroom above that for
  // multipart overhead.
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
