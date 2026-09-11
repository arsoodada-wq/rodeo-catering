# Build Status

Tracking against the 12 implementation phases from the project brief.

## Phase 1 — Discovery ✅

- Inspected the existing `rodeoburgersandchicken.com` site: brand color
  (`#db594b`), Poppins typography, menu items, address/phone/hours, socials,
  existing (form-only, no pricing) catering page, existing `Restaurant`
  JSON-LD schema
- Confirmed local dev environment had no Node/Git — installed both
- Confirmed with the business owner: dev toolchain via winget, cloud
  Postgres (Neon/Supabase) for the database, AI concierge stubbed for now

## Phase 2 — Architecture ✅

- `prisma/schema.prisma`: full data model — auth/RBAC, CRM (Customer, Lead,
  Event), catering builder (Category, MenuItem, Package, PackageItem),
  orders, quotes, payments, service areas/delivery/availability, CMS
  (FAQ, Review, AwardRecognition, BlogPost, Page, Media), marketing
  (SocialPost, OutreachContact/Activity), SiteSetting, AuditLog
- Resolved Prisma 7's driver-adapter architecture (`src/lib/db.ts`,
  `prisma.config.ts`)

## Phase 3 — Design System 🟡 (started)

- Done: Tailwind v4 theme tokens (brand palette off `#db594b`, Poppins),
  `Button`, `Container` primitives
- Not done: full component library (cards, modals, form inputs, toasts),
  documented in a style guide page

## Phase 4 — Public Website 🟡 (all core pages live)

- Done: homepage, `/catering` (hub + wizard), `/corporate-catering`,
  `/live-cookout-catering`, `/birthday-party-catering`,
  `/graduation-catering`, `/wedding-catering`, `/about`, `/blog` (holding
  page), `/privacy-policy`, `/terms`, `/accessibility` (draft, noindexed).
  Header/Footer/mobile sticky CTA. All internal links verified working
  (`npm run build` prerenders all 13 routes)
- Not done: `/school-catering`, `/sports-team-catering`, `/party-catering`,
  `/large-group-catering`, `/burger-catering`, `/chicken-catering`, and
  location pages under `/catering/[slug]` (blocked on which `ServiceArea`
  rows the business confirms — see seed data)

## Phase 5 — Catering Wizard 🟡 (wizard built, AI layer stubbed)

- Done: 8-step wizard on `/catering#builder` (event type → guests → date →
  location → style → food selections → contact → review/submit), wired to
  a `submitCateringLead` server action that creates a `Lead` row. Never
  shows a fabricated price — the review step explains the team will follow
  up with a quote. Verified the full flow end-to-end in the browser,
  including the DB-not-configured error path
- Fixed in this phase: `src/lib/db.ts` constructed `PrismaClient` eagerly
  at import time, so a missing `DATABASE_URL` threw outside of any
  try/catch and hung the UI on submit. Now lazy via a `Proxy`
- Not done: the natural-language AI concierge layer on top of this wizard
  (section 13), `get_*` server-side tool functions for it (section 15)

## Phase 6 — CRM / Quotes 🟡 (lead capture + admin view)

- Done: catering wizard creates real `Lead` rows; admin can view all leads
  and update status (`/admin/leads`)
- Not done: quote generation/PDF, follow-up workflow, editing lead details

## Phase 7 — Admin Dashboard 🟡 (auth + pricing screens)

- Done: Auth.js v5 credentials login (`/admin/login`), JWT sessions, first
  admin bootstrapped via `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `prisma/seed.ts`.
  Dashboard home (lead counts by status, recent leads), a full leads list
  with inline status updates, and **working pricing editors**
  (`/admin/menu`, `/admin/packages`) — set a price/mark a package active and
  it goes live on the public `/catering` page immediately
- Fixed three real bugs, all caught by testing against a real database
  rather than just reading the code:
  1. The route gate file was at the project root instead of `src/` (Next.js
     requires it co-located with `src/app` in a src-dir project) and was
     silently never running.
  2. The gate relied on Auth.js's `authorized` callback, which let requests
     through when `AUTH_SECRET` was unset instead of blocking — rewrote it
     to check `req.auth` directly so it fails closed. Also renamed
     `middleware.ts` → `src/proxy.ts` per Next.js 16's renamed convention.
  3. Event dates displayed one day early in the admin leads list — a date
     stored as UTC midnight was being formatted in the server's local
     timezone. Fixed with a shared `formatEventDate` helper
     (`src/lib/format.ts`) that always formats in UTC.
- Verified end-to-end against a real local PostgreSQL database (installed
  in this environment specifically for this): logged in, submitted a real
  catering wizard lead, confirmed it appeared in `/admin/leads` with the
  correct date, updated its status and confirmed it persisted after
  reload, set a menu item's price and confirmed it persisted, activated a
  package with real pricing and confirmed it appeared — and only it — on
  the public catering page
- Not done: RBAC enforcement beyond login (role field exists on `User` but
  isn't checked anywhere yet), management screens for every other content
  type in the schema (service areas, FAQs, reviews, awards, blog, pages,
  media, social, outreach, users)

## Phase 8 — CMS / SEO 🟡 (SEO fundamentals done)

- Done: `sitemap.xml`, `robots.txt`, `CateringBusiness` JSON-LD structured
  data (verified facts only — see `SEO_GUIDE.md`)
- Not done: page editor, blog CMS, per-page SEO editing UI

## Phase 9 — Marketing ⬜ not started

Social content calendar, outreach CRM UI (schema exists; no UI yet).

## Phase 10 — Security / Performance audit ⬜ not started

## Phase 11 — Testing ⬜ not started

No automated tests yet.

## Phase 12 — Production readiness ⬜ not started

## Open business confirmations needed before launch

Search the codebase for `REQUIRES BUSINESS CONFIRMATION`. Known items:

- Catering pricing (all menu items/packages currently have `price: null`)
- Minimum guest count, lead time, delivery fees
- Service areas beyond Worth, IL (candidates seeded inactive)
- FAQ answers (questions seeded, answers pending)
- Vegan/Halal/Kosher accuracy (existing site is inconsistent — homepage says
  Halal, catering page says Kosher)
- Production domain for this catering site
- Real event/food photography (homepage currently uses typography-led
  hero sections rather than stock photos, per the brief's instruction to
  avoid generic stock imagery)
