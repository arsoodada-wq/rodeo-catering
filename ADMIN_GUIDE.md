# Admin Guide

_Partial — login, leads, and pricing work today and have been verified
against a real database; most other management screens listed below don't
exist yet (see `PROJECT_STATUS.md`, Phase 7)._

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
(there's still no self-service password-change screen — see "What will
eventually live here" for that).

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
4. Change your password after first login (there is no self-service
   password-change screen yet — update it via `npm run db:studio` on the
   `User` table's `passwordHash`, hashed with bcrypt, or re-run the seed
   with a new `ADMIN_PASSWORD`).

There is no signup flow by design — every admin account is created this
way or (once built) by an existing Super Admin.

## What works today

- **Dashboard** (`/admin`): lead counts by status, 5 most recent leads
- **Leads** (`/admin/leads`): full list of catering wizard submissions,
  with a dropdown to update each lead's status (New, Contacted, Quote
  Sent, Follow-Up, Confirmed, Completed, Lost). Click a name to open its
  detail page — full contact/event info, requested food, and a form to
  create a quote
- **Quotes**: from a lead's detail page, add line items (description,
  quantity, unit price), optional fees/discount/tax/deposit/expiration,
  and click "Create & Get Link" — you get a private link
  (`/quote/<token>`) to send the customer directly. No login required on
  their end; the link itself is the access control, so only send it to
  the actual customer. Creating a quote for a new lead automatically
  moves it to Quote Sent; the customer accepting it automatically moves
  the lead to Confirmed. See all quotes at `/admin/quotes`
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
  toggle delivery availability, add a new city, or delete one. Only
  Active cities show up in the footer, the catering page's service-area
  card, and the wizard's location step — **never activate a city until
  it's actually confirmed**, and check the "Where are you located" FAQ
  afterward (its answer is free text and won't update itself)

## What will eventually live here

- Self-service password change (today an admin's password can only be
  reset by a Super Admin at `/admin/users`, or via `npm run db:studio`)
- Adding brand-new menu items/packages (today's screens edit existing ones;
  use `npm run db:studio` to add new rows — FAQs, Reviews, Awards, and
  Service Areas are the exception, which already support adding new
  entries directly)
- Delivery fees (a `DeliveryFee` model exists per service area; no editor yet)
- Quote PDF export, editing/re-sending an existing quote, orders
- Managing blog posts and landing pages
- Managing SEO metadata per page
- Managing social content calendar and outreach CRM
- Managing users and permissions

## In the meantime

For anything not listed under "What works today," use Prisma Studio
directly:

```bash
npm run db:studio
```

This opens a visual database browser at `http://localhost:5555` — usable
for basic edits (e.g., setting a package's price) but not a substitute for
the real dashboard screens.
