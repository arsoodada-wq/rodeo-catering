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

## Phase 4 — Public Website 🟡 (homepage only)

- Done: homepage (hero, why-Rodeo, event types, menu showcase, live
  cookout/corporate teasers, process, testimonials + award, service
  area/FAQ, final CTA), Header/Footer/mobile sticky CTA
- Not done: `/catering`, `/corporate-catering`, `/live-cookout-catering`,
  and the other event/location landing pages listed in the brief (section 20)

## Phase 5 — Catering Wizard ⬜ not started

Step-by-step builder (event type → guest count → date → location → style →
food → recommendation → estimate), grounded AI concierge tool layer.

## Phase 6 — CRM / Quotes ⬜ not started

Lead capture wiring, quote generation + PDF, follow-up workflow.

## Phase 7 — Admin Dashboard ⬜ not started

`/admin` with auth, RBAC (roles are modeled in Prisma; enforcement + UI not
built), and management screens for every content type in the schema.

## Phase 8 — CMS / SEO ⬜ not started

Page editor, blog, SEO controls, sitemap/robots, structured data beyond the
homepage.

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
