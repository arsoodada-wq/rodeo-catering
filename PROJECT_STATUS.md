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

## Phase 3 — Design System ✅

- Done: Tailwind v4 theme tokens (brand palette off `#db594b`, Poppins),
  and a full component library in `src/components/ui/`:
  - `Button.tsx`, `Container.tsx` (already existed)
  - `Card.tsx` — the base container now used throughout the admin dashboard
  - `Badge.tsx` — status pills with a tone system (neutral/info/success/
    warning/danger), paired with a shared tone map in `src/lib/status.ts`
    so lead and quote statuses render consistently everywhere they appear
  - `Input.tsx`, `Textarea.tsx`, `Select.tsx`, `Checkbox.tsx` — thin
    wrappers around the existing `.input` style with optional
    label/hint/error props
  - `Modal.tsx` and `ConfirmDialog.tsx` — an accessible dialog (portal,
    Escape to close, click-outside to close) with a delete-confirmation
    convenience wrapper on top
  - `ToastProvider.tsx` / `useToast()` — mounted once in the root layout,
    usable anywhere via a hook, no prop drilling
- Documented all of it on `/style-guide` (noindexed, not linked from
  anywhere public) — colors, typography scale, every button/badge/card
  variant, form inputs, and live interactive demos of the modal and toast
- Real adoption, not just a demo page: replaced the browser's built-in
  `confirm()` popup — which can't be styled and blocks the JS thread —
  with `ConfirmDialog` in all four places that used it (Service Areas,
  Reviews, Awards, FAQs), each now also firing a success/error toast on
  the result. Replaced the flat, uncolored status pills on the Dashboard,
  Quotes list, and a lead's Quotes section with color-coded `Badge`s
- Verified end-to-end: exercised every component on `/style-guide` in the
  browser (color swatches, badge tones, opened both the plain modal and
  the confirm dialog, triggered all three toast tones), then created a
  real throwaway FAQ in the live admin dashboard and deleted it through
  the new `ConfirmDialog` + toast flow to confirm the migration didn't
  just look right but actually still deletes. Re-verified the whole
  style guide page against a real production build (`next build &&
  next start`) since this project has a history of bugs that only
  surfaced there — it prerenders statically and the modal/toast/hydration
  all worked identically to dev mode

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
- Confirmed by the business: catering orders require 48 hours notice. The
  date step greys out (via the native date input's `min`) any date sooner
  than that, with a clear message, and `submitCateringLead` has a looser
  24-hour server-side floor as defense in depth against bypassing the UI.
  Single source of truth is `cateringPolicy.minLeadTimeHours` in
  `src/lib/site-content.ts` — the public FAQ answer reads from it too
- Not done: the natural-language AI concierge layer on top of this wizard
  (section 13), `get_*` server-side tool functions for it (section 15)

## Phase 6 — CRM / Quotes 🟡 (lead capture + quotes, no PDF)

- Done: catering wizard creates real `Lead` rows; admin can view all leads
  and update status (`/admin/leads`), and drill into a lead detail page
  (`/admin/leads/[id]`) showing full contact/event info, requested food,
  and any quotes already sent
- Done: a real quote workflow. From a lead's detail page, `QuoteBuilder`
  creates a `Quote` with dynamic line items, fees/discount/tax, an
  optional deposit and expiration date, and hands back a link built on the
  `Quote.secureToken` already in the schema (same trust model as a
  password-reset link — no customer login). The public page at
  `/quote/[token]` marks itself VIEWED on first open, offers an
  AcceptQuoteButton that sets ACCEPTED + `acceptedAt` and bumps the
  lead to CONFIRMED, and blocks accepting an expired/declined quote.
  Creating a quote for a NEW/CONTACTED lead auto-advances it to
  QUOTE_SENT. `/admin/quotes` lists every quote with status and total.
  Never shows or lets an admin type a price that isn't explicitly entered
  — no line item defaults to anything but $0
- Verified the entire loop twice — once in dev, once against a real
  production build (`next build && next start`, since a few earlier
  features only broke under real caching behavior dev mode doesn't
  reproduce): submitted a wizard lead, opened its detail page, created a
  quote, confirmed the lead auto-advanced to QUOTE_SENT, opened the public
  quote link and confirmed it flipped to VIEWED, accepted it and confirmed
  ACCEPTED + the lead moving to CONFIRMED, all against real Postgres data
- One transient artifact noted, not a bug: immediately after accepting, a
  screenshot briefly showed the wrong accepted-on date; a fresh full page
  load showed the correct one, and the raw database value was correct the
  whole time (verified via direct query) — looks like a dev-mode
  fast-refresh race on the server-action-triggered soft navigation, not
  incorrect data or logic
- Not done: quote PDF export, an editing/re-send flow for an existing
  quote, follow-up reminders

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
- Also added: FAQ management (`/admin/faqs`) — edit, activate/deactivate,
  add, and delete FAQs, all reflected immediately on the public homepage
  and catering page (which now read active FAQs from the database instead
  of a hardcoded list). Building this surfaced a real seeding bug: FAQ rows
  used a positional id (`seed-faq-0`, `seed-faq-1`, ...) with a
  non-destructive upsert, so reordering the seed array silently mismatched
  new content onto old rows' ids instead of updating them — the public
  page kept looking correct only because it happened to be hitting a
  fallback path, not real data. Fixed by switching to stable slug ids
  (`faq-location`, `faq-lead-time`, etc.) and cleaning up the stale rows.
  Verified create/edit/activate/delete each reflect live on the public
  site with no rebuild needed
- Also added: Reviews (`/admin/reviews`) and Awards (`/admin/awards`)
  management. The homepage's testimonials and award badge (both in `Hero`
  and `Testimonials`) were hardcoded from `site-content.ts` despite real
  seeded `Review`/`AwardRecognition` data existing in the database this
  whole time — same class of gap as the FAQ one, now fixed the same way
  (DB-backed via `src/lib/public-data.ts`, static content only as a
  fallback). Found and fixed a second real bug while verifying this: the
  review seed used `createMany` + `skipDuplicates`, but `Review.id` is an
  auto-generated cuid with nothing else unique to dedupe against, so
  `skipDuplicates` could never actually detect a repeat — every re-seed
  silently added 3 more copies of the same three reviews. By this point
  in the session that had run enough times to leave 12 duplicate rows
  (4x each) live on the homepage. Fixed with stable ids + upsert, cleaned
  up the duplicates, and confirmed the row count stays at 3 across
  repeated seed runs. Verified toggling a review's visibility off/on
  reflects live on the homepage
- Also added: Service Areas (`/admin/service-areas`) management. Same gap
  again: `confirmedServiceAreas = ["Worth, IL"]` was hardcoded in
  `site-content.ts` and used in three places (Footer, the wizard's location
  step, the FAQ fallback) despite a real `ServiceArea` table with 13 seeded
  cities (1 active, 12 candidates) sitting unused. Now Footer and the
  catering page's service-area card read active cities from the database
  via `getConfirmedServiceAreas()`; the wizard (a client component) gets
  the list passed down as a prop from the `/catering` page instead of
  importing the static constant directly. Verified end-to-end: activated a
  second city in admin, confirmed it appeared in the footer and the
  catering page immediately, then deactivated it again since it wasn't a
  real confirmed area — that was a test, not an actual business decision.
  Caught one more real bug while testing: the "Proudly based in ___"
  heading was built from `serviceAreas[0]` after an alphabetical sort, so
  activating "Alsip" (which sorts before "Worth") made the page claim the
  business is based in Alsip — a real city, not the actual location. Fixed
  by always deriving that heading from the real business address, with
  active service areas only ever listed as "Also serving," never as the
  home base
- Done: RBAC enforcement. The schema already had `Permission`/`RolePermission`
  tables built for exactly this ("grant/revoke capabilities without a code
  change") but nothing used them — wired them up instead of hardcoding role
  checks. Super Admin always has full access (hardcoded, can't be revoked or
  misconfigured). Manager/Staff/Marketing access is controlled by real rows,
  editable at `/admin/permissions` (Super Admin only) via a checkbox matrix
  that writes straight to the database. Every mutating server action
  (leads, quotes, menu, packages, service areas, FAQs, reviews, awards) now
  checks the signed-in user's permission before touching the database — not
  just a hidden sidebar link, an actual backend check. Pages a role can't
  use show "Access restricted" instead of the editor, whether reached via
  the sidebar (which also hides links they can't use) or a direct URL.
  Seeded a reasonable default split (Manager: everything; Staff: leads +
  quotes; Marketing: content) and documented in `ADMIN_GUIDE.md` as a
  developer default, not a business-confirmed policy
- Verified end-to-end: created a real STAFF-role test account, confirmed its
  sidebar only showed Dashboard/Leads/Quotes, confirmed navigating directly
  to `/admin/menu` and `/admin/permissions` both showed "Access restricted"
  rather than the real screen, confirmed it could still fully use Leads
  (its actual granted permission), then toggled Staff's service-areas
  permission on in the matrix as Super Admin, confirmed the change hit the
  database directly via `psql`, confirmed it survived a full page reload
  (not just optimistic client state), then reverted it and deleted the test
  account
- Done: admin account management (`/admin/users`, Super Admin only) —
  create a new admin account with a temporary password and a role, edit an
  existing one's name/role/active status, reset a password. Auth.js's JWT
  didn't carry the user's own id into the session (only role was attached),
  which this needed for a self-lockout guard — added it to the jwt/session
  callbacks in `src/lib/auth.ts`. The guard blocks a Super Admin from
  deactivating their own account or changing their own role, enforced both
  client-side (disabled fields) and server-side (the actual check, in case
  the client is bypassed) — the account this project ships with is
  currently the only Super Admin, so this isn't a hypothetical
- Verified end-to-end: created a real MANAGER-role account through the UI,
  signed out, signed in as that account, and confirmed its sidebar showed
  exactly the Manager permission set (everything except Admin Accounts and
  Permissions) with no extra code needed to make that happen — it's the
  same permission check every other page already uses. Deleted the test
  account afterward
- Not done: management screens for every other content type in the schema
  (blog, pages, media, social, outreach), self-service password change.
  Note:
  the "Where are you located" FAQ answer is free text (admin-owned, not
  templated), so it will drift from the real service-area list unless
  manually updated — the Service Areas admin page reminds admins of this

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
- Minimum guest count, delivery fees
- Service areas beyond Worth, IL (candidates seeded inactive)
- FAQ answers (questions seeded, answers pending)
- Vegan/Halal/Kosher accuracy (existing site is inconsistent — homepage says
  Halal, catering page says Kosher)
- Production domain for this catering site
- Real event/food photography (homepage currently uses typography-led
  hero sections rather than stock photos, per the brief's instruction to
  avoid generic stock imagery)
