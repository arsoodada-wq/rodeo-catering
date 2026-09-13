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
 * Audited every resource this app's pages actually load in the browser
 * before writing this (Phase 10 had deliberately skipped a CSP until that
 * audit was done — see PROJECT_STATUS.md): no next/image remote domains
 * configured, no third-party <script>/<link> tags, no analytics/pixel
 * scripts (the GA/Meta/TikTok env vars in .env.example are unused
 * placeholders — see the Phase 12 notes), Poppins is self-hosted by
 * next/font (no fonts.googleapis.com request at runtime), and the only
 * client-side fetch() calls (ConciergeChat, every admin form) hit this
 * same origin. The Anthropic/Resend API calls happen server-side inside
 * API routes and Server Actions, never from the browser, so they need no
 * connect-src entry — CSP only governs what the page itself loads.
 * `'unsafe-inline'` stays for script-src/style-src rather than a
 * nonce-based policy: Next.js's own hydration/bootstrap scripts and
 * Tailwind's runtime style injection both need it, and building the
 * nonce-per-request plumbing (which has to move header generation out of
 * this static next.config.ts and into src/proxy.ts) is a bigger, riskier
 * change than this pass — everything else here is still a real
 * restriction: no external script, image, font, or connection origin can
 * load at all.
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
// model this header defends against). Verified for real against a
// production build (`next build && next start`), not just reasoned about —
// see PROJECT_STATUS.md.
const productionOnlyHeaders =
  process.env.NODE_ENV === "production"
    ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }]
    : [];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...securityHeaders, ...productionOnlyHeaders],
      },
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
