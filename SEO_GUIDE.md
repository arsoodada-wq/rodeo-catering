# SEO Guide

_Partial — the admin SEO controls (Phase 8) don't exist yet, but the
code-level conventions below are in place and should be followed as more
pages are built._

## What's implemented today

- `src/app/layout.tsx` sets a title template (`%s | Rodeo Burgers & Chicken
  Catering`) and a default meta description — every new page should export
  its own `metadata` (or `generateMetadata`) rather than relying on the
  default
- `metadataBase` is derived from `NEXT_PUBLIC_SITE_URL` — never hard-code
  the domain in a page

## Conventions to follow as new pages are added

- **One `<h1>` per page.** Homepage sections use `<h2>` for their headings;
  keep that hierarchy intact on new pages
- **Structured data:** the existing site's `Restaurant` JSON-LD (captured
  during discovery) is a useful reference, but don't copy it — author a
  `LocalBusiness`/`FoodEstablishment` + `Service` schema for this catering
  site once the business confirms the facts it asserts (price range, hours,
  service area). Never include fabricated review counts/ratings in schema
- **Location pages** (`/catering/[slug]`): only publish for `ServiceArea`
  rows with `active: true` — see `PROJECT_STATUS.md` for why most
  candidate suburbs are seeded inactive
- **Canonical URLs, OG images, and noindex flags** are modeled on the
  `Page` and `BlogPost` Prisma models (`seoTitle`, `seoDescription`,
  `canonicalUrl`, `ogImageId`, `noindex`) — wire these into each page's
  `generateMetadata` as the CMS is built, rather than inventing a parallel
  system

## Still to build

- XML sitemap (`app/sitemap.ts`) and `robots.txt` (`app/robots.ts`)
- Per-page SEO editing UI in the admin dashboard
- FAQ schema (only once real, business-confirmed answers exist — see the
  inactive FAQ seed rows in `prisma/seed.ts`)
- Google Search Console / Analytics wiring (env vars are already stubbed in
  `.env.example`)
