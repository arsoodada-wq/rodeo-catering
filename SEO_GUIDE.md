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
   phone, `areaServed`. Currently scoped to Worth only; expand
   `areaServed` once the business confirms additional service areas (see
   `ServiceArea` seed data — most candidates are seeded inactive)
4. **Location pages** — `/catering/[slug]` for each confirmed city (e.g.
   "Catering in Palos Heights, IL"), each targeting that city's own local
   search intent. Not built yet: blocked on the business confirming which
   candidate suburbs are actually served, since publishing a page for a
   city the business doesn't actually cater to would be worse than not
   ranking for it at all
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
