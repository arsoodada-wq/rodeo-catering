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

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
