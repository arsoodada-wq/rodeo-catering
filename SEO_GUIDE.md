# SEO Guide

_Partial — the blog has its own SEO title/description/canonical overrides,
and the 15 static marketing pages now have admin-editable title/description
overrides too (`/admin/seo`, Phase 8, 2026-09-12). Still no generic
page-builder for the `Page` model. The code-level conventions below are in
place and should be followed as more pages are built._

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
   `"<Service> in <City>, IL"` or `"<Service> Near <City>, IL"`. An admin
   can now tune any static page's exact title/description without a
   redeploy at `/admin/seo`, in case a specific keyword phrasing turns out
   to perform better once there's real Search Console data to look at
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
7. **Blog content** (`/blog`, built 2026-09-12) — genuinely useful local
   content (e.g. "how much food for a 50-guest graduation party in Worth,
   IL") is a real, if slower, ranking lever for the exact "catering near
   me"-style queries above. Empty until an admin actually writes and
   publishes posts at `/admin/blog` — see `ADMIN_GUIDE.md`

## What's implemented today

- `src/app/layout.tsx` sets a title template (`%s | Rodeo Burgers & Chicken
  Catering`) and a default meta description — every new page should export
  its own `metadata` (or `generateMetadata`) rather than relying on the
  default. `metadataBase` is derived from `NEXT_PUBLIC_SITE_URL` — never
  hard-code the domain in a page
- `src/app/sitemap.ts` — lists every static public route, plus (async)
  every active `/catering/[slug]` location page and every Published
  `/blog/[slug]` post, both pulled live from the database — add new static
  pages here as they're built, but location pages and blog posts need no
  manual addition, they follow whatever's active/published in the admin
- `src/app/(site)/blog/[slug]/page.tsx` — `generateMetadata` uses the
  post's `seoTitle`/`seoDescription` when set, otherwise falls back to the
  raw title and an auto-generated excerpt (`excerpt()` in
  `src/lib/format.ts`) — never manually re-append the site's brand name to
  a title here, `src/app/layout.tsx`'s title template already does that
  once for every page. Also emits `BlogPosting` JSON-LD alongside the
  `CateringBusiness` schema already on every page. A draft, deleted, or
  nonexistent slug 404s rather than rendering, same as location pages
- `src/lib/seo-pages.ts` + `src/lib/seo-overrides.ts` — every static
  marketing page (homepage, `/catering`, `/about`, all 11 event/menu
  pages, `/blog`) calls `resolvePageMetadata(path)` from
  `generateMetadata` instead of exporting static `metadata`, so an
  `/admin/seo` override (stored in `SiteSetting` as `seo:<path>`) takes
  effect immediately. `seo-pages.ts` holds each page's real default
  title/description — the admin screen's placeholder text and the live
  fallback both read the same registry, so they can't drift. The
  homepage is the one page that must pass `resolvePageMetadata(path,
  true)` — `true` wraps its title as `{ absolute }` so Next.js's title
  template (which every other page's plain-string title still gets)
  doesn't double up the brand name on the one title that already *is*
  the full branded string. Adding a new static page to the sitemap?
  Register it in `seo-pages.ts` and call `resolvePageMetadata` from its
  `generateMetadata` rather than a fresh static `metadata` export
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
  `canonicalUrl`, `ogImageId`, `noindex`). `BlogPost` is wired up
  end-to-end (`seoTitle`/`seoDescription`/`canonicalUrl` all read in
  `/blog/[slug]`'s `generateMetadata`; `ogImageId` still isn't, since no
  image upload/media picker UI exists yet for either model) — follow the
  same wiring, not a parallel system, whenever the `Page` model gets its
  own editor

## Still to build

- A generic block-based editor for the `Page` model, and `ogImageId`
  support for both `Page` and `BlogPost` (needs a media upload/picker UI
  first)
- FAQ schema (only once real, business-confirmed answers exist — see the
  inactive FAQ seed rows in `prisma/seed.ts`)
- Review schema (only with real, sourced permalinks — see `PROJECT_STATUS.md`)
- Google Search Console / Analytics wiring (env vars are already stubbed in
  `.env.example`)
