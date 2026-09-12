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

## Phase 4 — Public Website ✅

- Done: homepage, `/catering` (hub + wizard), `/corporate-catering`,
  `/live-cookout-catering`, `/birthday-party-catering`,
  `/graduation-catering`, `/wedding-catering`, `/about`, `/blog` (holding
  page), `/privacy-policy`, `/terms`, `/accessibility` (draft, noindexed).
  Header/Footer/mobile sticky CTA. All internal links verified working
  (`npm run build` prerenders all 13 routes)
- Done: location pages at `/catering/[slug]`. Previously blocked on which
  `ServiceArea` rows the business confirms — unblocked 2026-09-12: the
  business confirmed catering covers roughly a 15-mile radius from Worth.
  Checked every existing candidate suburb's straight-line distance from
  Worth against that radius (all 11 fell well inside it, farthest being
  Tinley Park at 8.3 mi) and activated them — each now has a real,
  indexable landing page (e.g. "Catering Near Chicago Ridge, IL"), added
  to `sitemap.ts` dynamically from the active `ServiceArea` rows. Left
  "Chicago" itself inactive rather than guessing: it's a big city and only
  its southwest-side neighborhoods actually fall inside 15 miles — still
  `REQUIRES BUSINESS CONFIRMATION` on which specific neighborhoods, if
  any, should get their own page. The `CateringBusiness` JSON-LD
  (`LocalBusinessSchema.tsx`) was also made dynamic (was hardcoded to
  Worth only) and now includes a `GeoCircle` for the 15-mile radius plus
  every active city — reads live from the database instead of being
  frozen at whatever was true when it was written, the same class of bug
  the FAQ answer already had to be fixed for once
- Verified end-to-end: confirmed all 12 location pages render correctly
  and 404 for `chicago-il` (inactive) and a nonexistent slug; confirmed
  the homepage's JSON-LD via the browser's own parsed `<script>` tag shows
  the `GeoCircle` and all 11 cities; confirmed the footer, `/catering`
  page's service-area card, and the FAQ answer all picked up the new list
  automatically (no code change needed there — they already read from
  `getConfirmedServiceAreas()`)
- Done: the remaining event/menu-focused landing pages — `/school-catering`,
  `/sports-team-catering`, `/party-catering`, `/large-group-catering`,
  `/burger-catering`, `/chicken-catering`. Same `EventLandingTemplate`
  pattern as the other five, same "in Worth, IL" title convention, added
  to `sitemap.ts` and to a new "More Catering" footer column (the
  original "Catering" column already had 6 links — a 12-link single
  column would've been an unreasonably long list, so split it in two
  rather than cram it in). Verified all 6 build, prerender statically,
  and render correctly in the browser
- All pages named in the original 67-section brief now exist. Not done:
  any additional public pages beyond what the brief specified

## Phase 5 — Catering Wizard 🟡 (wizard + AI concierge both built)

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
- Done: the natural-language AI concierge layer (section 13) with its
  `get_*`/`submit_*` tool functions (section 15). On `/catering`, a tab
  switcher ("Chat with Us" / "Guided Builder") lets a visitor either
  describe their event in plain language or use the original step-by-step
  form — same lead pipeline either way. Uses the Claude API
  (`@anthropic-ai/sdk`) with four tools: `get_menu_and_packages`,
  `get_service_areas`, and `check_event_date` are read-only lookups
  against the live database (never invented — the system prompt
  explicitly forbids stating a price, area, or policy without calling the
  matching tool first); `submit_catering_lead` calls the *exact same*
  `submitCateringLead` server action the guided wizard uses, so a lead
  from either path gets identical validation and lands in the same
  `Lead` table. The system prompt requires the AI to summarize what it
  has and get an explicit yes before submitting — it can't silently
  create a lead mid-conversation
- The whole feature is optional and fails safe: with no `ANTHROPIC_API_KEY`
  set, `/catering` shows only the guided builder — no tab switcher, no
  dead UI, nothing implying a feature that isn't there. Rate-limited
  per-IP (30 messages/hour) on top of the existing per-IP limit already on
  lead submission itself. Model is configurable via `ANTHROPIC_MODEL`
  (defaults to `claude-sonnet-5` — a cost/quality balance appropriate for
  a chat that's mostly structured extraction and tool calls, not deep
  reasoning; documented in `.env.example` so the business can trade up to
  Opus or down to Haiku)
- Verified end-to-end with real requests, not just code review: confirmed
  `/catering` shows the plain wizard with zero AI UI when
  `ANTHROPIC_API_KEY` is unset; confirmed the tab switcher and chat
  interface appear correctly once a key is configured; sent a real
  message through the full pipeline (browser → rate limiter → Anthropic
  API → error handling → UI) and confirmed via server logs that the only
  failure was the test key itself being rejected (`401
  authentication_error`) — proving every other piece of the plumbing
  works, since no real key was available to test a full conversation.
  Found and fixed a real bug in the process: the chat input's Enter-to-
  send only worked via a raw keydown check, which this browser
  automation's synthesized Enter keypress didn't trigger — replaced it
  with a native `<form onSubmit>`, then confirmed via a direct
  `form.requestSubmit()` call that the fix is correct (this is also just
  the more standard way to implement "Enter submits" in the first place)
- Not done: streaming responses (each reply currently arrives all at once,
  which is fine for the short, tool-call-heavy replies this concierge
  gives, but would matter for longer ones), conversation persistence
  across a page reload (a refresh starts a new chat)

## Phase 6 — CRM / Quotes 🟡 (lead capture, quotes, and editing — no PDF)

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
- Done: editing and resending a quote. `/admin/quotes/[id]` (linked from
  both `/admin/quotes` and a lead's quote list) lets an admin change line
  items, fees/discount/tax/deposit/terms/expiration and save — the
  server action (`update-quote.ts`) recomputes totals through the same
  shared `computeQuoteTotals` the create flow uses, replaces the line
  items in a transaction, and keeps the *same* `secureToken`. There's no
  separate "resend" step because there's nothing to resend: the customer's
  link always renders whatever's currently in the database, so saving an
  edit is the resend. A quote that lapsed to `EXPIRED` is automatically
  brought back to `SENT` the moment it's edited, reopening the same link
  to accepting. A quote the customer already `ACCEPTED` or `DECLINED` is
  locked — the edit page shows why instead of a form, since changing the
  record of what they already agreed to isn't editing, it's rewriting
  history; the admin creates a fresh quote instead
- Verified end-to-end: created a real quote, edited its unit price through
  `/admin/quotes/[id]`, confirmed the total recalculated correctly and the
  `secureToken` stayed identical via a direct database query, confirmed
  the *same* public link showed the updated total with no separate resend
  action, then accepted it and confirmed the edit page immediately
  switched to the locked "can't be edited" state. Also covered by 5 unit
  tests (`update-quote.test.ts`) for the recompute, the EXPIRED→SENT
  transition, and both lock cases. Cleaned up the test quote afterward
- Not done: quote PDF export, follow-up reminders

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

## Phase 8 — CMS / SEO 🟡 (SEO fundamentals + blog CMS done)

- Done: `sitemap.xml`, `robots.txt`, `CateringBusiness` JSON-LD structured
  data (verified facts only — see `SEO_GUIDE.md`)
- Done: a real blog CMS on the existing `BlogPost` schema (modeled in
  Phase 2, unused until now — same situation as Phase 9's social/outreach
  tables). `/admin/blog` lists every post (draft and published) with a
  "Write a new post" form that auto-generates a URL slug from the title;
  `/admin/blog/[id]` is the full editor — title, an editable slug (with a
  live "view" link once published), category, tags, plain-text content
  (paragraphs separated by a blank line — deliberately not a rich-text/
  HTML editor, since every author here is a trusted admin and this avoids
  the XSS surface a `dangerouslySetInnerHTML` renderer would introduce for
  no real benefit yet), and a "search appearance" section for an optional
  SEO title/description override and canonical URL. A post stays invisible
  to the public site until its status is explicitly set to Published; the
  first time it's published, `publishedAt` is stamped and then preserved
  across later draft/republish cycles rather than reset
- Public side: `/blog` lists published posts (newest first) with an
  auto-generated excerpt when no SEO description is set; `/blog/[slug]`
  renders the full post, falls back to the raw title/an excerpt for
  `<title>`/meta description when no SEO override is set, respects a
  custom canonical URL when set, and emits `BlogPosting` JSON-LD
  (headline, dates, author/publisher) alongside the existing
  `CateringBusiness` schema already on every page. A draft, deleted, or
  nonexistent slug 404s rather than rendering anything, same reasoning as
  the service-area pages. Published posts are added to `sitemap.xml`
  dynamically, same pattern as active service areas
- Reused rather than duplicated: the same `slugify()` from Phase 11 (slug
  generation + uniqueness check, erroring rather than silently
  auto-suffixing on collision — consistent with how Service Areas already
  handles this), the same `CONTENT_MANAGE` permission FAQs/Reviews/Awards
  already use rather than adding a new one, and the same create → redirect
  → full-editor flow Phase 9's outreach contacts just established
- Found and fixed a real bug while verifying, not just reviewing: the
  blog post's SEO title fallback manually appended
  "| Rodeo Burgers and Chicken Catering", but the root layout already
  applies a `"%s | Rodeo Burgers & Chicken Catering"` title template to
  every page — the two combined to render the brand name twice in the
  browser tab and in search results. Fixed by letting the fallback be the
  bare title, matching how every other page in this app already does it
- Verified end-to-end against the real local database: created a real
  post through the UI, filled in two paragraphs of content, tags, and
  published it; confirmed via a direct `psql` query that status, tags, and
  `publishedAt` all saved correctly; confirmed the live page rendered both
  paragraphs, the tags, and a correctly-formed `BlogPosting` JSON-LD block
  (parsed and checked in the browser, not just eyeballed); confirmed the
  post's URL appeared in `/sitemap.xml`; confirmed `/blog` fell back to its
  "coming soon" empty state again after deleting the post; ran a full
  `next build` and confirmed `/admin/blog`, `/admin/blog/[id]`, and
  `/blog/[slug]` all register correctly as dynamic routes
- Not done: a generic block-based page editor for the `Page` model (its
  `content Json` field implies a real page-builder UI — a materially
  bigger, less-specified undertaking than the blog CMS, deliberately left
  for a dedicated pass rather than rushed alongside it), per-page SEO
  editing for the existing static marketing pages (homepage, catering,
  event/location pages) — those titles/descriptions are still hardcoded in
  each page's `generateMetadata`/`metadata` export, not database-editable

## Phase 9 — Marketing ✅

- Done: a social content calendar at `/admin/social` on top of the existing
  `SocialPost` schema (previously unused — the model existed since Phase 2
  but had no UI). Plan a post per platform with category, hook, caption,
  CTA, hashtags, a video concept and shot list (for TikTok/YouTube/Shorts),
  a status (Idea → Draft → Approved → Scheduled → Published), and a target
  date — sorted soonest-first. Explicitly scoped as a planning tool, not a
  publisher: nothing here posts to any platform automatically, and the page
  says so, since actually integrating with Meta/TikTok/YouTube's posting
  APIs is a real project of its own the brief didn't ask for
- Done: an outreach CRM at `/admin/outreach` on the existing
  `OutreachContact`/`OutreachActivity` schema (same situation — modeled in
  Phase 2, unused until now). Add a local partnership/backlink target
  (venue, school, chamber, blogger, etc.), track its status (Prospect →
  Contacted → Responded → Interested → Link Acquired / Not Interested), and
  open its detail page to log every call/email/meeting as a dated activity
  with notes, their response, and an optional follow-up date. Deleting a
  contact cascades to its logged activities (enforced at the schema level,
  `onDelete: Cascade`)
- Both screens are gated behind a new `marketing.manage` permission (added
  to the existing RBAC system from Phase 7, not a parallel one) — granted
  by default to Manager and Marketing roles, editable like every other
  permission at `/admin/permissions` with no code change. Every mutating
  server action (create/update/delete post, create/update/delete contact,
  add/delete activity) checks it before touching the database, same
  discipline as every other admin action in this app
- Extended the existing "status maps must stay in sync with the schema"
  test pattern from Phase 11 to the two new enums (`SocialStatus`,
  `OutreachStatus`) rather than just trusting the new label/tone maps by
  eye — this is the same class of bug (Phase 7) that made the admin leads
  list silently render an unstyled badge for a status nobody had mapped yet
- Verified end-to-end against the real local database, not just code
  review: logged in as Super Admin, confirmed "Social Calendar" and
  "Outreach" appear in the sidebar (they didn't before this change),
  created a real social post with hashtags and a scheduled date, edited
  its status, confirmed the change survived a full page reload and matched
  what a direct `psql` query showed, then deleted it and confirmed it was
  gone from the database, not just the screen. Repeated the same
  create → edit → verify-via-`psql` → delete → verify-gone loop for an
  outreach contact, including logging a real activity against it and
  confirming deleting the contact cascaded to delete the activity too. Ran
  a full `next build` afterward and confirmed both new routes compile and
  register correctly as dynamic (`ƒ /admin/social`, `ƒ /admin/outreach`,
  `ƒ /admin/outreach/[id]`)
- Not done: any actual publish integration with social platforms (out of
  scope — see above), reminders/notifications for outreach follow-up dates,
  bulk import of outreach contacts

## Phase 10 — Security / Performance audit 🟡 (audited, high/medium items fixed)

Ran a structured audit covering auth/brute-force, token entropy, IDOR,
injection, security headers, secrets hygiene, dependency vulnerabilities,
and cookie/session config. Findings and what was done about each:

- **Fixed — no rate limiting on admin login.** The Credentials `authorize()`
  callback (`src/lib/auth.ts`) had unlimited login attempts against
  `bcrypt.compare`. Added a simple in-memory rate limiter
  (`src/lib/rate-limit.ts`, unit tested) keyed by the submitted email — 10
  attempts per 15 minutes, same generic "invalid credentials" response
  either way so a lockout can't be distinguished from a wrong password by
  someone probing for valid emails. Keyed by email rather than IP so a
  distributed attempt against one account is still throttled. Caveat:
  in-memory means each server process has independent counters — fine for
  this app's actual single-server deployment shape, but would need a
  shared store (e.g. Upstash Redis) if it ever moves to multi-instance
  serverless
- **Fixed — public lead form had no spam protection.** `submitCateringLead`
  only validated shape, with nothing stopping a bot from flooding the
  `Lead` table. Added: an invisible honeypot field in the wizard's contact
  step (off-screen, `aria-hidden`, unreachable by Tab — a real visitor
  never sees or can fill it); a minimum-fill-time check (rejects a
  submission that arrives less than 3 seconds after the wizard mounted,
  since no human fills an 8-step wizard that fast); and a per-IP rate
  limit (5 submissions/hour, using the same `checkRateLimit` primitive).
  Honeypot/timing failures return a fake success without touching the
  database, so a bot never learns it was caught. Verified for real: a
  normal browser walkthrough (which naturally takes >3s and never touches
  the honeypot) still creates a real lead; unit tests cover the honeypot,
  timing, and rate-limit paths directly
- **Fixed — quote accept-link token was cuid, not built for unguessability.**
  `Quote.secureToken` defaulted to `cuid()`, which embeds a timestamp and
  counter for uniqueness rather than being a security token. Switched to
  an explicit `crypto.randomBytes(32)` (256 bits) generated in
  `createQuote` — no migration needed since the column was never a
  database-level default. Verified a real quote's token in the database
  after this change: 43 characters of base64url, as expected
- **Fixed — `acceptQuote` never checked `expiresAt`.** The public quote page
  already hides the Accept button once `expiresAt` has passed, but that's
  a client-side check only — nothing stopped the server action itself
  from accepting a quote past its expiration if called directly (nothing
  auto-transitions a quote to `EXPIRED` when its date passes, so it could
  sit in `SENT` status indefinitely). `acceptQuote` now checks `expiresAt`
  itself, transitions the quote to `EXPIRED`, and rejects the accept.
  Covered by a dedicated unit test with mocked Prisma/`next/cache`
- **Fixed — no security headers.** `next.config.ts` had none configured.
  Added `X-Frame-Options: DENY` (clickjacking protection — the admin
  login page previously had none), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive
  `Permissions-Policy`, and `Strict-Transport-Security` (inert over plain
  HTTP so harmless in local dev, takes effect once the real domain is
  live over HTTPS). Verified via a real fetch against the running dev
  server that all five headers are present on the response. Skipped a
  full Content-Security-Policy for now — doing one properly means
  cataloging every external resource this app loads first, and a rushed
  CSP that's either too loose to matter or breaks a legitimate resource
  is worse than none; flagged as a follow-up
- **Fixed — session lifetime.** Auth.js's 30-day JWT default applied to
  admin sessions with no override. Shortened to 7 days
  (`src/lib/auth.config.ts`) — a safer default for a session that can view
  customer contact info and create other admin accounts, not a
  business-confirmed policy
- **Fixed — `prisma` CLI misclassified as a runtime dependency** in
  `package.json`. Moved to `devDependencies` (it's a build/codegen tool,
  never imported by app code). Note: this does **not** fully resolve the 4
  high-severity `npm audit` findings (`deepmerge-ts`, `mysql2`) — they're
  pulled in transitively by `@prisma/client` itself (a genuine runtime
  dependency) via `@prisma/config`, so they end up in `node_modules`
  regardless of how `prisma` is classified. Confirmed neither vulnerable
  package is ever imported/executed by this app's code (this project only
  uses the Postgres adapter). `npm audit fix --force` "fixes" this by
  downgrading to `prisma@6.19.3` — a major-version rollback away from the
  no-Rust-engine driver-adapter architecture this project deliberately
  adopted (see Phase 2) — so that was **not** applied. No patched stable
  7.x release exists yet (7.10.0 is current; next release line is 8.0.0
  release candidates, not stable). Accepted as a monitored, low-real-risk
  finding until Prisma ships a real fix
- **Reviewed, no gap found — action-level authorization.** Every mutating
  server action in `src/app/actions/` calls `requirePermission()` (or the
  hardcoded Super-Admin-only check for user/permission management) as its
  first statement. `accept-quote.ts` is the sole intentional exception
  (public, token-gated, documented inline). No admin action lets a
  lower-privileged role reach data outside its granted permission
- **Reviewed, no gap found — injection/XSS.** No `$queryRaw`/`$executeRaw`/
  string-built SQL anywhere (Prisma throughout). One
  `dangerouslySetInnerHTML` (`LocalBusinessSchema.tsx`), serializing only
  hardcoded business constants — no user input reaches it
- **Reviewed, no gap found — secrets hygiene.** `.env` correctly
  gitignored and never committed; `.env.example` holds only placeholders;
  no hardcoded API keys/secrets in tracked source
- **Reviewed, no gap found — cookies.** No overrides in `auth.config.ts`/
  `auth.ts`, so Auth.js v5's defaults apply (`httpOnly`, `sameSite: lax`,
  `__Secure-` prefix once served over HTTPS) — acceptable for this app
- **Reviewed, confirmed — `robots.txt`.** Still correctly disallows
  `/admin`, `/api`, `/quote` (crawler hygiene only, not access control —
  the real access control is `src/proxy.ts` plus the per-action
  permission checks above)
- Not done: a real load/performance pass (this app has no traffic yet to
  profile), a proper CSP, migrating the in-memory rate limiter to a
  shared store (only matters if/when this moves to multi-instance
  serverless hosting)

## Phase 11 — Testing 🟡 (unit tests for the highest-risk logic; no e2e yet)

- Done: Vitest (`npm test` / `npm run test:watch`), configured with
  `vite-tsconfig-paths` so tests can use the same `@/*` imports as the app.
  20 tests across 5 files, all against pure logic — no test hits the real
  database or starts a server
- While writing these, found and fixed two real instances of duplicated
  business logic rather than just testing the duplication in place:
  1. The quote subtotal/total formula (`subtotal + fees + tax - discount`,
     clamped to never go negative) was written out twice — once in
     `create-quote.ts` (the source of truth that gets saved) and again in
     `QuoteBuilder.tsx` (the live preview an admin sees while building a
     quote). Two independent copies of the same formula is exactly the
     kind of thing that quietly drifts apart after one gets edited and the
     other doesn't — extracted both into `src/lib/quote-math.ts`
     (`computeQuoteTotals`), now the single source both places call
  2. The service-area slug formula was duplicated between `prisma/seed.ts`
     and `update-service-area.ts`'s `createServiceArea`. Left the seed
     script's version alone (changing it would alter already-seeded,
     possibly-referenced slugs for no benefit), but extracted the one used
     at runtime by admins adding a new city into `src/lib/slugify.ts`
  3. `src/lib/format.test.ts` specifically reproduces the UTC-date bug this
     project shipped once already (Phase 7) by forcing the test's
     timezone to `Etc/GMT+12` and asserting `formatEventDate` still shows
     the correct day — this is the kind of bug that hides completely on a
     machine whose local timezone happens to be UTC, so the test forces a
     timezone that would expose it either way
  4. `src/lib/status.test.ts` asserts `LEAD_STATUS_LABELS`/`_TONES` and
     `QUOTE_STATUS_TONES` have exactly the same keys as the real
     `LeadStatus`/`QuoteStatus` enums generated from the Prisma schema —
     so adding a new status to the schema without updating its badge/label
     will fail a test instead of silently rendering an unstyled fallback
  5. `src/lib/permissions.test.ts` asserts the SUPER_ADMIN short-circuit in
     `roleHasPermission` never touches the database at all (the guarantee
     that keeps `/admin/permissions` from being able to lock every admin
     out), plus the grant/deny paths for every other role
- Verified the refactor didn't change real behavior: filled out a real
  quote in the live `QuoteBuilder` UI (4 line items, fees, discount, tax),
  confirmed the on-screen preview total, created the quote, and confirmed
  via a direct database query that the saved subtotal/total matched the
  preview exactly — then deleted that test quote and reverted the lead's
  status, since it wasn't a real one
- Not done: component/UI tests, integration tests against a real
  database, end-to-end browser tests (Playwright or similar) for the
  wizard → lead → quote → accept flow

## Phase 12 — Production readiness ⬜ not started

## Open business confirmations needed before launch

Search the codebase for `REQUIRES BUSINESS CONFIRMATION`. Known items:

- Catering pricing (all menu items/packages currently have `price: null`)
- Minimum guest count, delivery fees
- ~~Service areas beyond Worth, IL~~ — confirmed 2026-09-12: ~15-mile
  radius from Worth. 11 suburbs activated with real location pages (see
  Phase 4). Still open: which specific Chicago neighborhoods, if any,
  fall inside that radius and should get their own page — "Chicago" as a
  whole city was deliberately left unconfirmed/inactive
- FAQ answers (questions seeded, answers pending)
- Vegan/Halal/Kosher accuracy (existing site is inconsistent — homepage says
  Halal, catering page says Kosher)
- Production domain for this catering site
- Real event/food photography (homepage currently uses typography-led
  hero sections rather than stock photos, per the brief's instruction to
  avoid generic stock imagery)
