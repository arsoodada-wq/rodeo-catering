# Rodeo Burgers & Chicken — Catering Platform

A dedicated catering lead-generation and ordering platform for Rodeo Burgers
and Chicken (Worth, IL), built separately from the existing regular-order
site at [rodeoburgersandchicken.com](https://www.rodeoburgersandchicken.com)
(which stays untouched).

## Project status

This is being built in phases (see `PROJECT_STATUS.md` for the current
checklist). **What exists and is verified working right now:**

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Full public site: homepage, `/catering` (with an 8-step catering wizard),
  corporate/live-cookout/birthday/graduation/wedding pages, about, blog
  holding page, legal placeholders — every internal link resolves
- The catering wizard creates real `Lead` rows in Postgres
- Admin dashboard at `/admin` (Auth.js v5 login, JWT sessions): lead list
  with status updates, and **working pricing editors** for menu items and
  packages — the business can set a price in `/admin/packages` and it
  appears on the public `/catering` page immediately, with everything else
  staying hidden until priced
- Sitemap, robots.txt, `CateringBusiness` structured data
- All of the above has been run end-to-end against a real local Postgres
  database in this environment (submit a lead → see it in admin → update
  its status → set a package price → see it go live on the public page) —
  not just built and assumed to work

**Not yet built:** the AI concierge layer on top of the wizard, quote
PDF generation, most other admin management screens (service areas, FAQs,
reviews, awards, blog/page CMS, social/outreach), RBAC enforcement, Stripe,
and email sending.

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Styling:** Tailwind CSS v4 (CSS-based theme in `src/app/globals.css`)
- **Database:** PostgreSQL via Prisma ORM 7 (driver-adapter architecture —
  see note below)
- **Auth:** Auth.js (NextAuth) v5, credentials + JWT sessions
- **Icons:** lucide-react

### A note on Prisma 7

Prisma 7 changed how the client connects: `datasource.url` no longer lives
in `schema.prisma`, and `PrismaClient` requires an explicit driver adapter
(`@prisma/adapter-pg` here). This is handled for you in `src/lib/db.ts` and
`prisma.config.ts` — you shouldn't need to touch either unless you change
database providers.

Also note: running `prisma init` on a fresh machine with this Prisma version
defaults to **Prisma Composer** (a separate microservices/cloud-deploy
product) instead of the classic ORM workflow. This repo intentionally does
**not** use Composer — `prisma.config.ts` and `prisma/schema.prisma` are
hand-authored for the standard `migrate`/`generate`/`studio` workflow.

### A note on Next.js 16 middleware

Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts` — route
gating lives at `src/proxy.ts`. With a `src/` project layout, this file
**must** live inside `src/`, not the project root, or it silently never
runs.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up your database

You need a Postgres connection string. Two options:

**Cloud (recommended for anything beyond local testing):** create a free
[Neon](https://neon.tech) or [Supabase](https://supabase.com) project and
copy its connection string.

**Local Postgres:** install PostgreSQL, create a database, and point
`DATABASE_URL` at it — e.g.
`postgresql://postgres:yourpassword@localhost:5432/rodeocatering`. This repo
was verified end-to-end against a local instance set up exactly this way.

```bash
cp .env.example .env
```

Edit `.env`: set `DATABASE_URL`, generate an auth secret, and set
`ADMIN_EMAIL`/`ADMIN_PASSWORD` for your first admin login:

```bash
npx auth secret
```

### 3. Run migrations, generate the client, and seed

```bash
npm run db:generate   # generates the Prisma client into src/generated/prisma
npm run db:migrate    # creates tables from prisma/schema.prisma
npm run db:seed       # creates your admin user + verified seed data
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site,
[http://localhost:3000/admin/login](http://localhost:3000/admin/login) for
admin (sign in with `ADMIN_EMAIL`/`ADMIN_PASSWORD`).

### 5. Run the tests

```bash
npm test          # run once
npm run test:watch
```

Unit tests only — pure logic (`src/lib/**/*.test.ts`), no database or
server required.

## Project structure

```
prisma/
  schema.prisma       # full data model (CRM, menu/packages, quotes, CMS, etc.)
  seed.ts             # verified-facts-only seed data + first admin user
src/
  app/
    (site)/           # public pages — this route group carries the public
                       # Header/Footer/sticky-CTA layout
    admin/
      login/          # sign-in (outside the dashboard layout)
      (dashboard)/    # authenticated admin screens (sidebar layout)
    actions/          # server actions (lead submission, admin edits)
    api/auth/         # Auth.js route handler
  components/
    layout/           # public Header, Footer, mobile sticky CTA
    home/, catering/  # page sections
    admin/            # admin-only interactive components
    ui/               # Button, Container, other primitives
    seo/              # structured data
  lib/
    db.ts             # Prisma client singleton (lazy, driver-adapter setup)
    auth.ts / auth.config.ts  # Auth.js config (config split for Edge safety)
    site-content.ts   # interim static content, shaped to mirror the DB
                       # models it will be replaced by once the CMS ships
    format.ts         # shared display-formatting helpers
  proxy.ts             # route gate for /admin (Next.js 16's renamed
                       # "middleware" convention — must live in src/)
  generated/prisma/   # generated Prisma client (gitignored, regenerate with db:generate)
```

## Environment variables

See `.env.example` for the full list. `DATABASE_URL` and `AUTH_SECRET` are
required for anything beyond the public marketing pages; `ADMIN_EMAIL`/
`ADMIN_PASSWORD` are required to log into `/admin` (there is no signup
flow by design). Everything else (email, Stripe, the AI concierge,
analytics) is feature-detected and stays inactive until its keys are set.

## Business facts vs. placeholders

Per the project brief, nothing in this codebase invents business-critical
facts (pricing, service areas, policies, reviews, awards). Anything not yet
confirmed by the business is either:

- Left `null`/inactive in the database (see `prisma/seed.ts`), or
- Marked literally as `REQUIRES BUSINESS CONFIRMATION` in code/content

Search the codebase for that string to find every open item before going
live.

## Other docs

- `PROJECT_STATUS.md` — phase-by-phase build checklist and what's next
- `ADMIN_GUIDE.md` — what the admin dashboard can do today
- `DEPLOYMENT.md`, `SEO_GUIDE.md` — deployment and SEO conventions
