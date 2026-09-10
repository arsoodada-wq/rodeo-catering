# SEO Guide

_Partial — the admin SEO controls (Phase 8) don't exist yet, but the
code-level conventions below are in place and should be followed as more
pages are built._

## What's implemented today

- `src/app/layout.tsx` sets a title template (`%s | Rodeo Burgers & Chicken
  Catering`) and a default meta description — every new page should export
  its own `metadata` (or `generateMetadata`) rather than relying on the
  default. `metadataBase` is derived from `NEXT_PUBLIC_SITE_URL` — never
  hard-code the domain in a page
- `src/app/sitemap.ts` — lists every public route; add new public pages
  here as they're built. Location pages under `/catering/[slug]` aren't in
  it yet since none are published (see below)
- `src/app/robots.ts` — allows everything except `/admin` and `/api`,
  points to the sitemap
- `src/components/seo/LocalBusinessSchema.tsx` — `CateringBusiness`
  JSON-LD rendered on every `(site)` page via its layout. Built only from
  verified facts in `src/lib/site-content.ts` (name, address, phone, email,
  socials). Deliberately omits `priceRange`, any `areaServed` beyond Worth,
  and any review/rating data — none of that is confirmed. Don't add those
  fields until the business confirms them; don't copy the existing
  restaurant site's `Restaurant` schema wholesale, since its `priceRange`
  and cuisine list describe the dine-in menu, not catering
- Admin routes are `noindex, nofollow` via `src/app/admin/layout.tsx`
  metadata; legal placeholder pages are `noindex` individually

## Conventions to follow as new pages are added

- **One `<h1>` per page.** Homepage sections use `<h2>` for their headings;
  keep that hierarchy intact on new pages
- **Location pages** (`/catering/[slug]`): only publish for `ServiceArea`
  rows with `active: true`, and add them to `sitemap.ts` when you do — see
  `PROJECT_STATUS.md` for why most candidate suburbs are seeded inactive
- **Canonical URLs, OG images, and noindex flags** are modeled on the
  `Page` and `BlogPost` Prisma models (`seoTitle`, `seoDescription`,
  `canonicalUrl`, `ogImageId`, `noindex`) — wire these into each page's
  `generateMetadata` as the CMS is built, rather than inventing a parallel
  system

## Still to build

- Per-page SEO editing UI in the admin dashboard
- FAQ schema (only once real, business-confirmed answers exist — see the
  inactive FAQ seed rows in `prisma/seed.ts`)
- Review schema (only with real, sourced permalinks — see `PROJECT_STATUS.md`)
- Google Search Console / Analytics wiring (env vars are already stubbed in
  `.env.example`)
