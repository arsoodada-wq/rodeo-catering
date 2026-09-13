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

## Phase 5 — Catering Wizard ✅

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
- Done: streaming replies. `runConciergeTurnStream` (`src/lib/ai/concierge.ts`)
  drives the same tool-use loop as before, but via `client.messages.stream()`
  instead of `.create()`, forwarding each text delta through a callback as
  it's generated. `/api/concierge` streams these to the browser as
  newline-delimited JSON (`{type:"delta"|"done"|"error", ...}` — a custom
  minimal protocol, not SSE, since this is a same-origin `fetch()` chat
  widget with no need for `EventSource`'s reconnection semantics); the
  early rate-limit/not-configured/validation-error responses are still
  plain JSON, and the client branches on the response's `Content-Type` to
  tell the two apart. `ConciergeChat.tsx` reads the stream via
  `response.body.getReader()`, buffering partial lines across chunk
  boundaries, and appends each delta to a growing assistant bubble in
  place of the previous all-at-once "Thinking…" wait
- Done: conversation persistence across a page reload, via
  `sessionStorage` (deliberately not `localStorage` — this is chat
  history that may contain a name/email/phone typed mid-conversation, and
  session-scoped storage means it clears when the tab actually closes
  rather than lingering indefinitely in the browser). Restored via a lazy
  `useState` initializer, not an effect, so a reload shows the resumed
  conversation on the very first render rather than flashing the empty
  greeting first. A completed (`leadSubmitted`) conversation also
  persists, so a reload doesn't let a customer land back in an active
  chat and accidentally submit a second lead for the same conversation.
  Added a "Start Over" control (both mid-chat and on the post-submit
  screen) since persistence otherwise has no way back to a fresh
  conversation short of closing the tab
- Verified end-to-end with real requests, not just unit tests (a new
  `concierge.test.ts` covers the loop logic itself — streamed deltas,
  the tool-call continuation, the lead-submitted flag, and the
  max-iterations fallback, all against a mocked SDK stream): set a real
  (deliberately invalid) Anthropic key, sent a real message, and
  confirmed via server logs the request reached Anthropic's API and came
  back with a genuine `401 authentication_error` — delivered to the
  browser correctly as a `{type:"error"}` event through the new streaming
  protocol, with the empty placeholder bubble removed rather than left
  blank. Separately confirmed the persistence itself needs no API key at
  all: sent a message, reloaded the actual page, and confirmed both the
  greeting and the sent message were still there; clicked "Start Over,"
  reloaded again, and confirmed the chat came back empty
- Not done: showing the concierge's own tool calls to the user (e.g. "checking
  the menu…") — the streamed text is only the assistant's actual reply,
  which is what the system prompt already keeps concise

## Phase 6 — CRM / Quotes ✅

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
- Done: quote PDF export. `/api/quotes/[token]/pdf` renders the quote —
  business header, customer/event details, the same line items and
  fees/tax/discount/total/deposit/balance breakdown as the public page —
  to a real PDF via `@react-pdf/renderer` (`renderToBuffer`, Node runtime;
  no new binary/headless-browser dependency like Puppeteer, which matters
  for a Next.js app that may end up on serverless hosting). Generated
  on-demand from the live database on every request rather than cached or
  persisted anywhere — a quote can still be edited (see above), and a
  stored PDF would risk going stale the moment that happens, so the
  existing `Quote.pdfUrl` schema field (present since Phase 2, unused
  until now) stays intentionally unused rather than pointing at a file
  that could silently drift from the real numbers. Uses the *same* trust
  model as `/quote/[token]` itself — the unguessable token is the access
  control, so no separate auth check, and it works identically whether a
  customer clicks it from their quote page or an admin clicks it from the
  dashboard. A "Download PDF" link was added in three places: the public
  quote page, the admin quote edit screen's link box, and — since an
  *accepted/declined* quote skips that edit screen entirely for a locked
  message instead — the quote detail header itself, so a PDF is always
  reachable regardless of status
- Verified against real, pre-existing quote records (not just a
  freshly-created test one): fetched the PDF for an unlocked $240 quote
  and a locked/`ACCEPTED` $1,400 quote with fees, a deposit, and a
  balance, confirmed both came back `200` with `Content-Type:
  application/pdf` and a real `%PDF` file signature, and used the `Read`
  tool's own PDF support to confirm the rendered page actually shows the
  correct customer name, line items, and every total field (including the
  fees/deposit/balance breakdown, which the simpler quote didn't
  exercise) — not just that *a* PDF came back. Ran a full `next build`
  and confirmed the route registers correctly
- Done: follow-up reminders (2026-09-12) — reconsidered the earlier "needs
  a deployment first" call: the scheduler doesn't have to live inside this
  app at all. `.github/workflows/follow-up-reminders.yml` runs on a daily
  cron via GitHub Actions (independent infrastructure this repo already
  has, regardless of what host the app itself eventually runs on) and
  calls a new `/api/cron/follow-up-reminders` endpoint, guarded by a
  shared `CRON_SECRET` so it can't be triggered by anyone else. That
  endpoint calls `sendFollowUpDigestEmail()` (`src/lib/reminders.ts`),
  which reuses the Phase 12 email infrastructure to send one digest
  covering three things that already had a `followUpDate`/`expiresAt`
  field sitting unused: **leads** whose follow-up date has arrived
  (`Lead.followUpDate` — previously had a schema column but zero UI
  anywhere to set it; added a "Follow-Up Reminder" section to the lead
  detail page for that), **quotes** expiring within 2 days that are still
  `SENT`/`VIEWED` (previously only checked reactively when someone tried
  to accept an expired one), and **outreach contacts** with an activity
  follow-up date due (`OutreachActivity.followUpDate` — Phase 9 already
  built the UI to *set* this, but nothing ever read it back until now).
  Sends nothing on a day with nothing due, since a digest that arrives
  every day regardless of content trains the reader to stop opening it
- The workflow itself does nothing until the site is actually deployed —
  it needs `SITE_URL` and `CRON_SECRET` set as GitHub repository secrets
  first, which the workflow file's own comments explain — but the code,
  the endpoint, and the email logic are all real and fully working today;
  the only missing piece is a URL for GitHub Actions to call, which was
  the actual blocker, not "needs to be built once hosting exists"
- Verified end-to-end against the real database and a real running
  server, not just the 7 new unit tests (`reminders.test.ts`, covering
  the three query filters and the mapped digest shape, plus the
  send-nothing-when-empty and send-nothing-without-an-admin-email guards):
  set a real overdue follow-up date on an actual lead (Sarah Chen) through
  the live admin UI and confirmed it via `psql`; temporarily gave a real
  quote (Q-2026-0002) a near-future `expiresAt`; called the actual cron
  endpoint with a real bearer token and got back
  `{leadsDue: 1, quotesExpiring: 1, outreachDue: 0}`; confirmed via server
  logs the console-fallback digest email listed the exact right lead,
  status, quote number, customer name, dollar amount, and both correct
  admin deep-links; confirmed a wrong token and a missing token both get a
  flat 401 with no distinguishing detail. Reverted both pieces of test
  data via `psql` immediately after and confirmed clean. Ran a full
  `next build` and confirmed the route registers correctly

## Phase 7 — Admin Dashboard ✅

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
- Done: self-service password change, at `/admin/account` (linked as "My
  Account" next to Sign Out — available to every signed-in admin, not
  permission-gated, since it only ever touches your own account).
  `changeOwnPassword` requires the *current* password to verify before
  setting a new one (`bcrypt.compare` against the stored hash) — without
  that check, anyone who got hold of an unattended, already-logged-in
  session could lock the real owner out permanently just by setting a new
  password. Rate-limited per-account (5 attempts/15 min, the same
  `checkRateLimit` primitive used for login attempts) for the same reason:
  no CAPTCHA exists here, so unlimited guesses at the current password
  would otherwise turn a stolen session cookie into a full account
  takeover
- Verified end-to-end against the real admin account, not just unit
  tests (4 new tests in `change-own-password.test.ts` cover the wrong-
  current-password rejection, the successful hash update, and the rate
  limit): submitted the real wrong current password and confirmed
  rejection; changed the real dev admin's password through the actual
  UI, signed out, and confirmed logging back in with the *new* password
  worked; then changed it back to the original and confirmed that login
  worked too — so the account was left exactly as documented in `.env`,
  not accidentally altered by testing this
- Done: a media library (2026-09-12) — the one piece of Phase 7 that had
  been marked blocked on "needs a hosting decision first," reconsidered
  the same way the Phase 6 cron blocker was: it needed *a* file-upload
  pipeline, not necessarily one tied to a specific host. `/admin/media`
  stores uploaded images as `data:` URIs directly in the existing
  `Media.url` field (a Prisma `String`/Postgres `text` column with no
  length cap — no schema migration needed) rather than in S3/R2/Vercel
  Blob/etc. This is a deliberate call for this app's actual scale (a
  local catering business's handful of menu/blog photos, not a
  high-volume gallery): Postgres is the one piece of infrastructure
  already guaranteed to exist no matter which host is eventually chosen,
  so the library works identically today in local dev and after any
  future deploy, with no vendor account or API key to set up first.
  Upload validates file type (JPEG/PNG/WebP/GIF/SVG only) and a 4MB cap
  server-side, not just in the file picker's `accept` attribute; the
  default Server Action body limit (1MB) was raised to 5MB in
  `next.config.ts` to fit. If this business ever uploads hundreds of
  large photos, swapping what `uploadMedia()` writes to `url` for a real
  object-storage upload later is a contained change, not a rewrite —
  not doing that today isn't a shortcut that creates a rewrite later, it's
  the same interface either way
- A `MediaPicker` component (grid thumbnail picker, not a dropdown of
  filenames) is the first real integration: added a "Featured Image"
  field to the Blog editor, wired through `BlogPost.featuredImageId` —
  present in the schema since Phase 2, unused until now, same situation
  as several other fields this session has found and finally wired up.
  Confirmed empirically (not assumed) what deleting an in-use image
  actually does: Prisma's default referential action for this optional
  relation is `SetNull`, not a foreign-key error — deleting an image sets
  any blog post using it back to no featured image rather than failing
  the delete or leaving a broken reference, and the confirm dialog's
  copy says so
- Verified end-to-end against the real database and a real running
  server, not just the 5 new unit tests (`media.test.ts`, covering the
  permission check, the type/size rejections, and the successful
  data-URI encoding): uploaded a real image file through the actual
  upload form (a synthetic `File` + `DataTransfer` injected into the real
  file input, since this session's browser automation has no native
  file-picker support — the button click and form submission were still
  the real ones), confirmed the stored `data:image/png;base64,...` value
  and metadata via a direct `psql` query, picked that image as a real
  test blog post's featured image through the actual `MediaPicker` UI,
  confirmed `featuredImageId` saved via `psql`, confirmed the image
  rendered correctly on both the public blog list and the post page,
  then deleted the image and confirmed via `psql` the post's
  `featuredImageId` went to `null` (not an error) and the post page still
  rendered cleanly with no broken image. Deleted the test post and image
  afterward. Ran a full `next build` and confirmed
  `/admin/media`/`/api/media`/`/api/media/[id]` all register correctly
- Done: a generic page builder for the `Page` model (2026-09-12) — the
  last content type in the schema with no admin UI at all. There's no
  business specification for what a "page builder" should look like, and
  guessing at a full drag-and-drop visual canvas risked building something
  bigger and less certain to actually match what's needed than the
  problem calls for. Scoped it down to what the `Page` model's own
  `content Json` field implies — an ordered list of a small fixed set of
  block types (heading, paragraph, image, button) — rather than inventing
  a bigger editor speculatively. `/admin/pages` lists pages and creates a
  new one (auto-slugged, starts as a draft, same create-then-redirect
  flow as Blog and Outreach); `/admin/pages/[id]` edits title, slug, an
  optional H1, the block list (add/reorder/delete, each block's fields
  edited inline — images pick from the Phase 7 Media Library via the same
  `MediaPicker`), the same SEO title/description/canonical override
  pattern Blog already uses, and a noindex toggle. A page stays invisible
  until explicitly Published, same discipline as Blog
- Public pages render at the site root (`/<slug>`, e.g.
  `/spring-catering-promotion`) via a `[slug]` catch-all
  (`src/app/(site)/[slug]/page.tsx`) rather than under a `/pages/` prefix
  — cleaner URLs, and safe because Next.js always prefers a literal
  route (`/about`, `/catering`, ...) over the dynamic catch-all at the
  same level. To close the one real risk that setup creates — a page
  slug that happens to match an existing static route would silently
  become unreachable — `createPage`/`updatePage` both refuse any slug in
  a new `RESERVED_PAGE_SLUGS` list (`src/lib/page-blocks.ts`) covering
  every existing top-level route, kept in sync by hand and documented as
  such. Published pages feed into `sitemap.xml`, skipping any marked
  noindex
- `parsePageContent()` deliberately drops an individual malformed block
  rather than failing the whole page render — content only reaches the
  database through `updatePage`'s own Zod validation, so a bad entry
  there would mean manual database editing or a future schema change, not
  normal operation, and a public page should degrade, not 500, if that
  ever happens
- Added 9 unit tests (`page-blocks.test.ts`) covering the block schema's
  acceptance/rejection cases, the malformed-block-dropping behavior, and
  the reserved-slugs list
- Verified end-to-end against the real database and a real running
  server: created a real page through the actual admin UI, added a
  heading, paragraph, and button block through the real block editor
  (reorder/delete controls included), published it, confirmed the exact
  structured JSON saved via a direct `psql` query, confirmed the live
  page rendered all three blocks in order with the header/footer intact
  and the correct (non-doubled) browser title, confirmed it appeared in
  `sitemap.xml`. Confirmed the reserved-slug guard for real: tried to
  rename the test page's slug to `about` through the actual form and got
  the exact rejection message back, then confirmed the real `/about`
  page was completely unaffected. Deleted the test page and confirmed
  its now-freed slug correctly 404s again (the proper branded 404, not
  a stale render). Ran a full `next build` and confirmed `/[slug]`
  registers as dynamic with no route conflicts against any existing
  static page — the exact risk this whole design had to rule out

## Phase 8 — CMS / SEO ✅

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
- Done: per-page SEO editing for the 15 static marketing pages (homepage,
  the catering hub, About, all 11 event/menu landing pages, and the blog
  index — everything with a fixed route; the dynamic per-item pages
  already have their own SEO fields from earlier phases: blog posts since
  this same phase, `/catering/[slug]` location pages inherently generate
  their own title from the city). `/admin/seo` lists every managed page
  with an optional title/description override, backed by the existing
  `SiteSetting` key-value table (`seo:<path>` keys) rather than a new
  model — the same "reuse, don't duplicate" call already made for content
  like site-wide business facts. Leaving both fields blank and saving (or
  clicking "Reset to default") deletes the override row entirely rather
  than storing an empty one, so the page falls back to its real default
  the moment it's cleared, not to a blank title
- `src/lib/seo-pages.ts` is the single source of truth for each managed
  page's default title/description — both the live page (via
  `resolvePageMetadata()` in `src/lib/seo-overrides.ts`) and the admin
  screen's placeholder text read from the exact same registry, so unlike
  the FAQ-answer/service-area drift bug from Phase 7, these can't
  silently diverge. Converting each page from a static `export const
  metadata` to `export async function generateMetadata()` was the only
  way to make this live-editable — Next.js resolves metadata per-request
  for `generateMetadata`, not once at build time
- Found and fixed a real bug while building this, of the exact class the
  blog post page already had to fix once: giving the *homepage* an
  overridable title hit the same title-template doubling, but worse —
  since the homepage previously had no `metadata` export at all, it was
  relying on the root layout's `title.default`, which is the one case
  Next.js does *not* template. The fix isn't "don't manually append the
  suffix" this time (there's nothing to remove) but the opposite:
  `resolvePageMetadata()` takes a `useAbsoluteTitle` flag, and the
  homepage passes `true` to wrap its title as `{ absolute: ... }` —
  Next.js's documented way to opt one page out of the site-wide template
  — while every other page passes a plain string and still gets the
  template applied normally
- Verified end-to-end against the real database, not just the 6 new unit
  tests (`seo-overrides.test.ts`, covering the default fallback, a full
  override, a partial (title-only) override, a DB-unreachable fallback,
  the homepage's `{ absolute }` wrapping, and the unregistered-path
  guard): confirmed the homepage's tab title was unaffected by adding its
  first-ever `generateMetadata` (still no doubled brand name); set a real
  title override for `/corporate-catering` through `/admin/seo`, confirmed
  it appeared instantly on the live page with the site's title template
  still applied correctly on top of it, confirmed the override row via a
  direct `psql` query; clicked "Reset to default," confirmed via `psql`
  the row was deleted (not left empty), and confirmed the live page
  reverted to its exact original title. Ran a full `next build` and
  confirmed every converted page still prerenders as static despite now
  reading from the database for its metadata, same as the homepage's
  existing FAQ/review sections already did
- Done: the generic page editor mentioned as "not done" above — see
  Phase 7, since a media library needed to exist first for its image
  block to be more than a placeholder, and it made more sense to build
  both together than to ship half of it
- Done: `og:image` meta tags (2026-09-13) — the last open item in this
  phase, unblocked now that the media library exists. `BlogPost.ogImageId`
  and `Page.ogImageId` (present in the schema since Phase 2, unused until
  now) were bare `String?` columns with no actual FK — converted both to
  real `Media?` relations (named relations, since `BlogPost` now points at
  `Media` twice — `featuredImage` and `ogImage` — and `Media` needed
  matching named back-relations to disambiguate); a Prisma migration
  applied this cleanly with no data loss since the columns already
  existed. The 15 static SEO-managed pages (`/admin/seo`) got the same
  capability without a schema change at all — `ogImageId` just joins the
  existing `title`/`description` override already stored as JSON in
  `SiteSetting`
- The real obstacle wasn't the missing UI, it was that `Media.url` stores
  an uploaded image as a `data:` base64 URI (the Phase 7 design choice to
  avoid an object-storage vendor decision) — perfectly fine for an
  `<img src>` embedded directly in server-rendered HTML, but a
  `<meta property="og:image">` tag needs a real fetchable URL, since a
  social platform's crawler fetches it independently and doesn't accept a
  `data:` URI there. Added `/api/media/[id]/raw` — deliberately public and
  unauthenticated (unlike the existing admin-only `/api/media/[id]`),
  since a Facebook/X crawler has no admin session to send and every image
  in the library was uploaded for eventual public use anyway — which
  decodes the stored `data:` URI back into real bytes with the correct
  `Content-Type` and a long `immutable` cache header. `src/lib/og-image.ts`
  (`ogImagePath()`) is the one place that turns a Media id into that
  route's path, resolved to an absolute URL by the root layout's existing
  `metadataBase`. A blog post with no explicit `ogImageId` falls back to
  its `featuredImageId` before omitting the tag entirely — one fewer field
  an author has to fill in for the common case of "use the same photo for
  both." Next.js also auto-derives a `twitter:image`/`twitter:card` tag
  from the same `openGraph.images` array with no extra code
- Added 2 unit tests to `seo-overrides.test.ts` (no `openGraph` key when no
  image override is set; the exact resolved path when one is). Verified
  end-to-end against a real production build (`next build && next start`,
  not dev mode, since a crawler-facing tag is exactly the kind of thing
  that should be checked for real): uploaded a real test image through the
  actual upload form, set it as a real test blog post's `og:image`
  (deliberately leaving its featured image unset first) and confirmed via
  a raw `curl` of the live HTML that `<meta property="og:image">` (and the
  auto-derived `twitter:image`) pointed at `/api/media/<id>/raw`; confirmed
  that URL actually 200s with `Content-Type: image/png` and real,
  byte-valid PNG data (not just a 200); removed the override and confirmed
  the tag correctly fell back to the featured image's id instead; set a
  real (temporary) `og:image` override on the live `/corporate-catering`
  page through `/admin/seo` and confirmed it rendered there too; confirmed
  a nonexistent media id 404s cleanly rather than serving broken image
  data. Cleaned up the test post, test image, and the temporary SEO
  override immediately after

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

## Phase 10 — Security / Performance audit ✅

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
  server that all five headers are present on the response
- **Fixed — no Content-Security-Policy (2026-09-12).** Deliberately
  deferred earlier in this same audit until the app's actual resource
  usage could be cataloged rather than guessed at — a rushed CSP that's
  either too loose to matter or breaks a legitimate resource is worse
  than none. Did that audit now that the app has grown to its current
  size: no `next/image` remote domains configured anywhere, no
  third-party `<script>`/`<link>` tags, no analytics/pixel scripts (the
  GA/Meta/TikTok env vars are still unused placeholders — see Phase 12),
  Poppins is self-hosted by `next/font` (no runtime request to
  fonts.googleapis.com), and every client-side `fetch()` in the app
  (`ConciergeChat`, every admin form's Server Action) hits this same
  origin. The Anthropic/Resend calls happen server-side inside API routes
  and Server Actions, never from the browser, so they need no CSP
  allowance at all — CSP only governs what the page itself loads. Result:
  `default-src 'self'` with `frame-src`/`frame-ancestors`/`object-src
  'none'`, `base-uri`/`form-action 'self'`, and `img-src`/`font-src 'self'
  data:` — a real, meaningfully restrictive policy blocking any external
  script, image, font, or connection origin from loading at all.
  `script-src`/`style-src` keep `'unsafe-inline'` rather than a
  nonce-based policy: Next.js's own hydration/bootstrap scripts and
  Tailwind's runtime style injection both need it, and moving header
  generation from this static `next.config.ts` into `src/proxy.ts` to
  thread a per-request nonce is a bigger, riskier change than this pass —
  flagged as a possible future hardening step, not done now. Applied in
  production only (`process.env.NODE_ENV === "production"`) since `next
  dev`'s Turbopack HMR client opens its own WebSocket back to the dev
  server that a strict `connect-src` would otherwise block for no real
  security benefit — localhost isn't this header's threat model
- Verified against a real production server, not just written and
  assumed correct: ran `next build && next start` (the same
  dev/prod-parity discipline used throughout this project, since this
  class of bug has hidden from dev mode before), confirmed the
  `Content-Security-Policy` header was present and exactly as configured
  via a real `fetch()`, confirmed it was absent under `next dev`, then
  exercised the app for real under the production CSP with a clean
  browser tab (no stale console history) and watched for violations at
  every layer: the homepage, the full `/style-guide` page (opened the
  Modal, triggered a Toast — the two components most likely to hit an
  inline-style/script restriction), a real Server Action save-and-reset
  round trip on the new `/admin/seo` page (confirmed via a direct `psql`
  query both that the save landed and the reset cleaned it up), the
  catering wizard's step navigation, a direct same-origin `fetch()` to
  `/api/concierge` (confirmed it still correctly returns
  `notConfigured` rather than being blocked), `/api/health`, and a
  genuine 404 page. Zero CSP violations on any of them
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
- **Fixed — nonce-based CSP for `/admin/*` (2026-09-13).** Tried
  site-wide first — a nonce needs a fresh value every request, which
  means calling `headers()` somewhere every page renders, and
  `LocalBusinessSchema` (the component with one of this app's two
  `dangerouslySetInnerHTML` `<script>` tags) sits in the shared public
  site layout. That silently opted every public marketing page out of
  static generation — confirmed via a real `next build`: ~15 pages
  (homepage, all event-type pages, `/catering`, `/blog`) flipped from
  prerendered to server-rendered-per-request. Reverted that approach:
  slower page loads and full server-side work on every visit is a real
  cost, worse for SEO, for defense-in-depth against a script-injection
  class this app's own audit above found no actual vector for on the
  public site. Scoped the nonce to `/admin/*` instead — moved from
  `next.config.ts`'s static `headers()` into `src/proxy.ts`, which
  already ran per-request for the login gate. Those routes were already
  100% server-rendered for auth anyway (nothing given up there), no
  component under `/admin` uses `dangerouslySetInnerHTML` (so the policy
  needs zero exceptions — Next's own framework bootstrap scripts pick up
  the nonce automatically off the same header), and it's the genuinely
  higher-value surface to harden: session cookies and every mutating
  action live there. `next.config.ts` keeps the original site-wide
  `'unsafe-inline'` policy for everything except `/admin/*` (excluded via
  a custom-regex `source` path rather than trusting header-precedence
  between config and middleware to resolve correctly on its own).
  `src/proxy.ts`'s matcher stays `/admin/:path*`, exactly as before —
  broadening it to run on every route was the first thing tried and
  undone along with the site-wide nonce, since the auth-redirect logic
  would otherwise need re-guarding against firing on public pages too.
  Style-src keeps `'unsafe-inline'` even on `/admin/*`: a few components
  (`Hero`, `FinalCta`, `global-error`) use inline `style={{}}`
  attributes, and CSP has no nonce mechanism for style *attributes*
  (only `<style>` elements) — script-src is what actually stops an
  attacker's injected code from executing, which is the real value here
- Verified against a real production build (`next build && next start`),
  not just reasoned about: confirmed via `curl -I` that the homepage,
  `/catering`, and `/burger-catering` all still get the original
  `'unsafe-inline'` policy while `/admin/login` gets a distinct,
  freshly-generated nonce on every single request; confirmed all 47
  routes prerender exactly as before the change (no regression) via the
  build output; in a real browser, signed out, reloaded the real login
  form, signed back in, and did a real Server Action save-and-reset round
  trip on `/admin/seo` (exercising a client-side toast notification too)
  — zero CSP violations, zero console errors, at every step. Both the
  Vitest suite (110 tests, including the real-database quote-lifecycle
  integration tests) and the Playwright e2e test (which signs in as
  admin as part of its normal flow) still pass unchanged
- Not done: a real load/performance pass (this app has no traffic yet to
  profile), migrating the in-memory rate limiter to a shared store — not
  attempted, and no longer planned as a near-term item now that hosting
  is heading toward a single Hostinger VPS rather than multi-instance
  serverless, which is the only scenario where the current in-memory
  limiter would actually be wrong

## Phase 11 — Testing ✅

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
- Done (2026-09-13): the three gaps named above, closing this phase out.
  - **Component/UI tests** — added `@testing-library/react` + `jsdom`
    alongside the existing pure-logic tests, gated per-file via a
    `// @vitest-environment jsdom` docblock so the fast node-environment
    tests aren't slowed down. Covers the two highest-stakes interactive
    components that had zero automated coverage: `CateringWizard.tsx`
    (step-gating logic including the 48-hour minimum-notice guard, the
    exact payload sent to `submitCateringLead`, success/error states) and
    `QuoteBuilder.tsx` (live subtotal/total recalculation, add/remove line
    items, create vs. edit wiring, clipboard copy). Writing the
    `QuoteBuilder` tests surfaced a real, pre-existing accessibility gap —
    the per-row Qty/Unit Price inputs and the remove-line-item button had
    no accessible name at all for any row after the first (the visible
    label only renders once, above row 0) — fixed with `aria-label`
  - **Integration tests against a real database** — `quote-lifecycle.integration.test.ts`
    hits the actual local Postgres via the real `@/lib/db` client, no
    Prisma mocking (only the session and `revalidatePath`, which
    genuinely can't exist outside a real Next.js request, are stubbed).
    Covers create → auto-advance the lead to `QUOTE_SENT` → edit in place
    → accept → confirm the lead, plus the expiration guard and the
    can't-edit-an-accepted-quote lock — all verified against real rows
    and real Postgres `Decimal` math, not mocked return values. Skips
    itself via `describe.skipIf` when `DATABASE_URL` isn't configured.
    Confirmed idempotent and leaves no data behind across repeated runs
  - **End-to-end browser test** — added Playwright (`npm run test:e2e`),
    with one test driving a real Chromium browser against the real dev
    server and real database through the complete
    wizard → lead → quote → accept chain: a (simulated) customer fills
    out and submits the 8-step guided wizard; the lead is confirmed real;
    an admin signs in and creates a quote; a **second, separate browser
    context** — a genuinely different visitor, not just the same session
    reused — opens the quote link and accepts it; the acceptance is
    confirmed as a real status change on both the quote and the lead.
    State-changing steps go through the real UI; read-only verification
    (`e2e/db.ts`) uses raw `pg` queries rather than `@/lib/db`, since
    Prisma 7's generated client uses `import.meta` — real ESM with no
    CommonJS equivalent — which Playwright's default test transform can't
    load (Vitest's Vite-based transform handles it fine, which is why
    every other test in this project *can* just import `@/lib/db`
    directly). Getting this test green surfaced two real behaviors to
    account for, in the test rather than the app: the wizard's own
    anti-bot timing guard silently drops a submission filled in under 3
    seconds (exactly what a scripted test does) while still showing the
    same success message by design, so the test now waits it out; and a
    whole-dollar quote total renders as `$525`, not `$525.00`, since
    Prisma's `Decimal` drops trailing zeros
- Not done: visual regression testing, load/performance testing (see
  Phase 10), running the e2e suite in CI (no CI pipeline exists yet — it
  runs locally today against the local dev server and database)

## Phase 12 — Production readiness 🟡 (email notifications, error pages, health check done)

- Done: real new-lead email notifications, closing a gap `.env.example`
  had been documenting as if it already worked (`RESEND_API_KEY`,
  `EMAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL` were all present with comments
  describing behavior — `src/lib/email.ts` didn't exist until now). Without
  this, the only way to notice a new catering lead was to have the admin
  dashboard open — a real gap for a live business. `submitCateringLead`
  now emails `ADMIN_NOTIFICATION_EMAIL` with the lead's name, contact info,
  event type, guest count, date, style, and notes, plus a direct link to
  its admin detail page, every time a lead is created — through the
  guided wizard *or* the AI concierge, since both funnel through this one
  action. With no `RESEND_API_KEY` set, the email is logged to the console
  instead of sent (the "dev-safe default" `.env.example` already
  promised) rather than silently doing nothing
- A failed notification (bad key, Resend outage) never fails the lead
  submission itself — the lead is already committed to the database by
  the time the email is attempted, and the customer still sees "Request
  received!" either way. Covered by a unit test that deliberately makes
  the notification throw and asserts the submission still reports success
- Verified with real requests, not just unit tests: submitted a real lead
  through the actual wizard in the browser with no key set and confirmed
  the exact notification (name, all fields, correct formatting, working
  dashboard link) in the server console; then set a real (deliberately
  invalid) Resend API key, resubmitted, and confirmed via server logs
  that a real HTTP request reached `api.resend.com` and came back with
  Resend's own `401 "API key is invalid"` — proving the request-building,
  auth header, and error handling all work correctly, the same
  verification pattern used for the AI concierge in Phase 5. Cleaned up
  both test leads afterward; reverted the temporary test key
- Also fixed while auditing this: `.env.example`'s Stripe and analytics
  (GA/Meta Pixel/TikTok Pixel) sections were labeled "architecture-ready"
  and "feature-detected at runtime" — greps across the whole codebase
  confirmed neither is referenced anywhere in any code, so those claims
  were false. Relabeled honestly as reserved names for a future phase,
  not a switch anyone can currently flip
- Also cleaned up: five unused default Next.js starter assets
  (`public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`)
  left over from the initial scaffold — confirmed unreferenced anywhere in
  `src/` before deleting, so they weren't shipping as dead weight
- Fixed (2026-09-13) — the AI-concierge lead misattribution flagged above.
  Added `AI_CONCIERGE` to the `LeadSource` enum (migration), gave
  `submitCateringLead` an optional `source` param that defaults to
  `CATERING_WIZARD` (preserving the guided wizard's existing behavior with
  no caller changes needed there), and had the concierge's
  `submit_catering_lead` tool (`src/lib/ai/tools.ts`) pass
  `source: "AI_CONCIERGE"` explicitly. Also surfaced the field for the
  first time — added `LEAD_SOURCE_LABELS` to `src/lib/status.ts` (covered
  by the same enum-sync test pattern as the other status maps) and a
  small "via Guided Wizard" / "via AI Concierge" line on the lead detail
  page, so the correct attribution is actually visible somewhere, not
  just correct in the database
- Verified end-to-end: 3 new unit tests (2 in `submit-catering-lead.test.ts`
  for the default and explicit-source cases, 1 in `tools.test.ts`
  confirming the concierge tool passes `AI_CONCIERGE` through) plus the
  extended `status.test.ts` sync check; confirmed against a real,
  pre-existing wizard-submitted lead in the live admin UI that it now
  shows "VIA GUIDED WIZARD" (the concierge path can't be exercised
  end-to-end without a real Anthropic API key, same limitation noted for
  the concierge in Phase 5 — the unit test covers that path instead)
- Done: branded error/not-found pages, replacing Next.js's generic
  default ones. `(site)/not-found.tsx` and `(site)/error.tsx` render
  within the normal header/footer for a 404 or crash inside an actual
  page (e.g. an inactive service-area or blog slug calling `notFound()`);
  a true root-level `not-found.tsx` (deliberately bare — there's no
  matching layout tree to attach header/footer to for a URL with no
  route at all) covers a plain mistyped URL; `admin/error.tsx` gives the
  dashboard its own crash page instead of showing the public site's
  marketing CTA; `global-error.tsx` is the last-resort catch for a crash
  in the root layout itself, deliberately dependency-free (inline styles,
  no imports of app modules) so it can't fail for the same reason the
  layout did. Found and fixed a related bug while verifying this: Next.js
  doesn't apply a `not-found.tsx`'s own `metadata` export when a page
  calls `notFound()` manually (only for a real routing-level 404) — the
  page's own already-resolved `generateMetadata` return value sticks
  instead. `catering/[slug]` and `blog/[slug]` were both returning `{}`
  for a missing/inactive item, which silently fell back to the site's
  default indexable title instead of a noindexed "Page Not Found" — fixed
  both to return that explicitly. Verified every case for real: a
  deliberately-thrown test error under `(site)/` and under `admin/`
  (each removed immediately after confirming its boundary caught it), a
  real mistyped URL, and the fixed `/catering/chicago-il` title
- Done: `/api/health` — checks the database with a real query, returns
  503 if unreachable. For a hosting platform's or uptime monitor's health
  check once deployed, not a page for humans (already excluded from
  crawling — `robots.txt` already disallowed all of `/api`). Deliberately
  checks only the database, not optional integrations like Resend or
  Anthropic, since this app already fails safe without those — a missing
  API key isn't the same as the site being down
- Not done: an actual deployment (still blocked on the business
  choosing/buying a domain and a host — see "Open business confirmations"
  below), Google Search Console/Analytics wiring, a real load/performance
  pass, backup strategy for the production database

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
- ~~Real event/food photography~~ — partially addressed 2026-09-13: pulled
  real photos directly from the business's own existing site
  (rodeoburgersandchicken.com) and its Clover menu-photo CDN — the actual
  storefront, and real dishes (Flying Dutchman burger, Buffalo Chicken
  Bowl, Supreme Nachos, Fried Chicken Bowl) matched to the exact same
  named item wherever they appear (homepage hero/menu showcase, About,
  `/catering`, `/burger-catering`, `/chicken-catering`). Still open: none
  of the remaining 9 event-type pages (corporate, live-cookout, birthday,
  graduation, wedding, school, sports-team, party, large-group) have a
  real photo that actually matches their specific event type — the
  existing site has no corporate-lunch or wedding-catering photography to
  pull from, and inventing a generic "party" stock photo would be exactly
  the mismatched imagery this item was flagged to avoid. Real photography
  for those still needs the business (an event shoot, or photos from a
  past catered event)
