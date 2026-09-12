# SEO Guide

_Partial — the admin SEO controls (Phase 8) don't exist yet, but the
code-level conventions below are in place and should be followed as more
pages are built._

## Targeting local ("near me") search

There is no `<meta name="keywords">` tag anywhere, and there shouldn't be —
Google has ignored that tag since 2009. What actually drives local search
ranking, in rough order of impact:

1. **Google Business Profile** (business.google.com) — not part of this
   codebase at all. For "catering near me" specifically, this is usually
   the single biggest lever: category, service area, photos, posts, and
   especially reviews. If the business doesn't already have one claimed
   and optimized for catering (as opposed to the dine-in restaurant), that
   is the highest-leverage next step and it's outside what code can fix
2. **The page `<title>` tag** — every public page's title now includes
   "Worth, IL" (fixed 2026-09-12; previously only the homepage did — see
   `git log` for the commit). Every new page should follow this pattern:
   `"<Service> in <City>, IL"` or `"<Service> Near <City>, IL"`
3. **`CateringBusiness` JSON-LD** (`LocalBusinessSchema.tsx`) — address,
   phone, `areaServed`. As of 2026-09-12 this is dynamic (reads active
   `ServiceArea` rows) and includes a `GeoCircle` for the confirmed
   15-mile radius plus every active city — no longer hardcoded to Worth
4. **Location pages** — `/catering/[slug]` for each confirmed city (e.g.
   "Catering Near Chicago Ridge, IL"). Built 2026-09-12 for all 11 cities
   confirmed within the 15-mile radius; `generateStaticParams` isn't used
   (fetched dynamically per-request from `ServiceArea`, same pattern as
   `/catering`), and the route 404s for any slug that's missing or
   `active: false` — so a page never overclaims coverage. "Chicago" itself
   is still unconfirmed (see `PROJECT_STATUS.md`) and has no page
5. **Reviews and citations** — real reviews (Google, Yelp, Facebook) and
   consistent name/address/phone across every online listing. Three real
   reviews are already seeded from the business's own site; more, recent,
   real reviews help more than anything in this codebase can
6. **Google Search Console** — not wired up yet (env vars stubbed in
   `.env.example`). Needed to see what people are actually searching to
   find the site and to request faster indexing of new pages

## What's implemented today

- `src/app/layout.tsx` sets a title template (`%s | Rodeo Burgers & Chicken
  Catering`) and a default meta description — every new page should export
  its own `metadata` (or `generateMetadata`) rather than relying on the
  default. `metadataBase` is derived from `NEXT_PUBLIC_SITE_URL` — never
  hard-code the domain in a page
- `src/app/sitemap.ts` — lists every static public route, plus (async)
  every active `/catering/[slug]` location page pulled live from the
  database — add new static pages here as they're built, but location
  pages need no manual addition, they follow whatever's active in
  `/admin/service-areas`
- `src/app/robots.ts` — allows everything except `/admin` and `/api`,
  points to the sitemap
- `src/components/seo/LocalBusinessSchema.tsx` — `CateringBusiness`
  JSON-LD rendered on every `(site)` page via its layout. Address/phone/
  email/socials are still only ever the verified facts in
  `src/lib/site-content.ts`; `areaServed` is dynamic (active `ServiceArea`
  rows + a `GeoCircle` for the confirmed 15-mile radius). Still
  deliberately omits `priceRange` and any review/rating data — neither is
  confirmed. Don't add those fields until the business confirms them;
  don't copy the existing restaurant site's `Restaurant` schema wholesale,
  since its `priceRange` and cuisine list describe the dine-in menu, not
  catering
- Admin routes are `noindex, nofollow` via `src/app/admin/layout.tsx`
  metadata; legal placeholder pages are `noindex` individually

## Conventions to follow as new pages are added

- **One `<h1>` per page.** Homepage sections use `<h2>` for their headings;
  keep that hierarchy intact on new pages
- **Location pages** (`/catering/[slug]`): the route itself enforces
  `active: true` (404s otherwise) and `sitemap.ts` pulls the list live —
  activating a city in `/admin/service-areas` is the only step needed to
  publish (or unpublish) its page
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
