# Admin Guide

_Partial — login, leads, quotes, pricing, content, and marketing screens
work today and have been verified against a real database; a few screens
listed under "What will eventually live here" don't exist yet (see
`PROJECT_STATUS.md`)._

## Roles and permissions

Every admin account has one of four roles: **Super Admin**, **Manager**,
**Staff**, or **Marketing**. Super Admin always has full access to
everything (hardcoded — this can't be changed or accidentally revoked). What
the other three roles can do is controlled by real database rows, editable
at **`/admin/permissions`** (Super Admin only) — no code change or redeploy
needed to change who can do what.

Default assignments (a reasonable starting point set during development,
**not a business-confirmed policy** — adjust freely):

| Permission | Manager | Staff | Marketing |
| --- | --- | --- | --- |
| Manage leads | ✅ | ✅ | |
| Manage quotes | ✅ | ✅ | |
| Manage pricing (menu & packages) | ✅ | | |
| Manage service areas | ✅ | | |
| Manage content (FAQs, reviews, awards) | ✅ | | ✅ |
| Manage marketing (social calendar, outreach) | ✅ | | ✅ |

A user who lacks a permission sees the sidebar link disappear entirely, and
is shown a plain "Access restricted" message if they navigate to the URL
directly. Every server-side save/create/delete action re-checks the
permission too — this isn't just a hidden button, it's enforced on the
backend regardless of what the UI shows.

## Managing admin accounts

**`/admin/users`** (Super Admin only) — create a new admin account (name,
email, temporary password, role), edit an existing one's name/role/active
status, or reset someone's password. New accounts sign in at `/admin/login`
with the email and password you set — nothing is emailed automatically, so
share the temporary password with them yourself and ask them to change it
at **`/admin/account`** ("My Account," available to every signed-in admin)
the first time they log in.

You can't deactivate your own account or change your own role from this
screen, even as a Super Admin — this is a deliberate guard against locking
yourself out, enforced both in the UI and on the server. If you need to
change a Super Admin's own role, do it from a different Super Admin
account or via `npm run db:studio`.

## Logging in

1. Make sure `DATABASE_URL`, `AUTH_SECRET`, and `ADMIN_EMAIL`/`ADMIN_PASSWORD`
   are set in `.env` (see `.env.example`).
2. Run `npm run db:seed` — this creates your admin account (or updates its
   password if it already exists).
3. Go to `/admin/login` and sign in with `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
4. Change your password after first login at **`/admin/account`** ("My
   Account" in the sidebar) — you'll need to enter the current password
   to set a new one.

There is no signup flow by design — every admin account is created this
way or (once built) by an existing Super Admin.

## What works today

- **Dashboard** (`/admin`): lead counts by status, 5 most recent leads
- **Leads** (`/admin/leads`): full list of catering wizard submissions,
  with a dropdown to update each lead's status (New, Contacted, Quote
  Sent, Follow-Up, Confirmed, Completed, Lost). Click a name to open its
  detail page — full contact/event info, requested food, and a form to
  create a quote. Every new lead also emails `ADMIN_NOTIFICATION_EMAIL`
  (set in `.env`) with the key details and a direct link to its page — set
  `RESEND_API_KEY` (https://resend.com) to actually send it, or leave it
  blank during development and it logs to the server console instead
- **Quotes**: from a lead's detail page, add line items (description,
  quantity, unit price), optional fees/discount/tax/deposit/expiration,
  and click "Create & Get Link" — you get a private link
  (`/quote/<token>`) to send the customer directly. No login required on
  their end; the link itself is the access control, so only send it to
  the actual customer. Creating a quote for a new lead automatically
  moves it to Quote Sent; the customer accepting it automatically moves
  the lead to Confirmed. See all quotes at `/admin/quotes` — click a
  quote number (from there or from a lead's detail page) to open it.
  A "Download PDF" link is always available (next to "View as customer,"
  and again on the link box while creating/editing) — generated fresh
  from the current numbers every time, so it's never out of date even
  after an edit
- **Editing a quote**: open it and change anything — line items, fees,
  discount, tax, deposit, terms, expiration — then click "Save Changes."
  The customer's link doesn't change, so this *is* how you resend an
  updated quote: they just see the new numbers next time they open the
  same link. A quote that expired gets automatically reopened (back to
  "Sent") the moment you save an edit to it. Once a customer has
  **accepted or declined** a quote, it locks — you can't edit the record
  of what they agreed to. If the event changed enough to need new numbers
  at that point, create a fresh quote from the lead's page instead
- **Menu & Pricing** (`/admin/menu`): every menu item grouped by category —
  set a price, choose flat vs. per-person pricing, and toggle availability.
  Items with no price still show on the site, marked "available on
  request," so a customer is never shown a price nobody set
- **Packages** (`/admin/packages`): each catering package's base price,
  per-person price, guest range, and an Active toggle — **a package only
  appears on the public `/catering` page once Active is checked**, so
  nothing goes live with unconfirmed pricing by accident
- **FAQs** (`/admin/faqs`): edit any FAQ's question/answer, check "Visible
  on site" to publish it (unchecked ones stay saved but hidden), add brand
  new FAQs, or delete ones you don't need. Changes show on the homepage
  and catering page immediately — no rebuild needed
- **Reviews** (`/admin/reviews`): edit, activate/deactivate, add, or delete
  customer reviews shown on the homepage. **Only add real reviews from
  actual customers** — the form says this too, as a reminder
- **Awards** (`/admin/awards`): edit, activate/deactivate, add, or delete
  awards and recognition. The first one marked Active + "Show on homepage"
  is what appears in the hero badge. **Only add awards the business
  actually received** — never a placeholder or aspirational one
- **Service Areas** (`/admin/service-areas`): activate/deactivate cities,
  toggle delivery availability, add a new city, or delete one. Activating
  a city does four things immediately: it shows up in the footer, the
  catering page's service-area card, and the wizard's location step, *and*
  publishes a real, indexable page at `/catering/<city-slug>` (e.g.
  "Catering Near Chicago Ridge, IL") that search engines can find via the
  sitemap — **never activate a city until it's actually confirmed**, since
  deactivating it later takes the page down but doesn't un-index it from
  Google immediately. Check the "Where are you located" FAQ afterward
  (its answer is free text and won't update itself)
- **Blog** (`/admin/blog`): write and publish planning guides that live at
  `/blog`. A new post starts as a draft with an auto-generated URL slug
  (editable later) — it's never visible on the public site until you set
  its status to Published. Content is plain text (separate paragraphs with
  a blank line); there's an optional "search appearance" section to
  override the page title/description shown in Google, otherwise it falls
  back to the post title and an excerpt of the content automatically
- **Page SEO** (`/admin/seo`): override the Google search title/description
  for any of the 15 static pages (homepage, the catering hub, About, and
  every event/menu landing page) without a code change — leave a field
  blank (or click "Reset to default") to fall back to that page's real
  default, shown as the field's placeholder so you can see what's live
  before touching it. Changes apply immediately, no redeploy needed
- **Social Calendar** (`/admin/social`): plan and track social posts —
  platform, category, hook/caption/CTA, hashtags, a video concept and shot
  list for video-first platforms, status (Idea, Draft, Approved, Scheduled,
  Published), and a target date. This is a planning tool only — nothing
  here posts to any platform automatically; publishing still happens
  directly on Instagram/Facebook/TikTok/YouTube, and this just tracks
  what's queued up and what already went out (paste the live URL into
  "Published URL" once it does)
- **Outreach** (`/admin/outreach`): a lightweight CRM for local partnership
  and backlink outreach — venues, schools, churches, chambers of commerce,
  bloggers, anyone worth a relationship for referrals or a link back to the
  site. Add a contact, then open it to log every call/email/meeting as a
  dated activity with notes, their response, and an optional follow-up
  date — the status (Prospect, Contacted, Responded, Interested, Link
  Acquired, or Not Interested) tracks where things stand at a glance from
  the list view

## What will eventually live here

- Adding brand-new menu items/packages (today's screens edit existing ones;
  use `npm run db:studio` to add new rows — FAQs, Reviews, Awards, and
  Service Areas are the exception, which already support adding new
  entries directly)
- Delivery fees (a `DeliveryFee` model exists per service area; no editor yet)
- Orders (post-acceptance fulfillment tracking, distinct from the quote
  itself)
- A generic editor for building/editing standalone landing pages (the
  `Page` model), and a media library for uploading images
- Managing SEO metadata for the static marketing pages (blog posts already
  have their own SEO fields — see the Blog section above)

## In the meantime

For anything not listed under "What works today," use Prisma Studio
directly:

```bash
npm run db:studio
```

This opens a visual database browser at `http://localhost:5555` — usable
for basic edits (e.g., setting a package's price) but not a substitute for
the real dashboard screens.
