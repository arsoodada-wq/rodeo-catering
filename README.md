# Rodeo Burgers & Chicken — Catering Platform

A dedicated catering lead-generation and ordering platform for Rodeo Burgers
and Chicken (Worth, IL), built separately from the existing regular-order
site at [rodeoburgersandchicken.com](https://www.rodeoburgersandchicken.com)
(which stays untouched).

## Project status

This is being built in phases (see `PROJECT_STATUS.md` for the current
checklist). **What exists right now:**

- Next.js 16 (App Router) + TypeScript + Tailwind v4, scaffolded and building cleanly
- Prisma ORM schema modeling the full business domain (CRM, catering builder,
  quotes, payments, service areas, CMS, social/outreach — see `prisma/schema.prisma`)
- A real, responsive homepage using verified business content (not filler
  copy) — hero, event types, menu highlights, live cookout / corporate
  teasers, process, testimonials, service area, FAQ
- A seed script (`prisma/seed.ts`) that loads only verified facts; anything
  the business hasn't confirmed (pricing, extended service areas, FAQ
  answers) is left inactive/null and labeled `REQUIRES BUSINESS CONFIRMATION`

**Not yet built:** the catering wizard/AI concierge, admin dashboard, CRM
screens, quote PDF generation, blog/CMS editing UI, Stripe integration, and
email sending. These come in the next phases.

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Styling:** Tailwind CSS v4 (CSS-based theme in `src/app/globals.css`)
- **Database:** PostgreSQL via Prisma ORM 7 (driver-adapter architecture —
  see note below)
- **Auth:** Auth.js (NextAuth) v5, Prisma adapter — not yet wired into UI
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

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up your database

You need a Postgres connection string. The fastest free option is
[Neon](https://neon.tech) or [Supabase](https://supabase.com) — create a
project and copy its connection string.

```bash
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL` to your connection string. Also generate
an auth secret:

```bash
npx auth secret
```

### 3. Run migrations and generate the client

```bash
npm run db:generate   # generates the Prisma client into src/generated/prisma
npm run db:migrate    # creates tables from prisma/schema.prisma
npm run db:seed       # loads verified seed data (see prisma/seed.ts)
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
prisma/
  schema.prisma       # full data model (CRM, menu/packages, quotes, CMS, etc.)
  seed.ts             # verified-facts-only seed data
src/
  app/                # Next.js App Router pages
  components/
    layout/           # Header, Footer, mobile sticky CTA
    home/             # homepage sections
    ui/               # Button, Container, other primitives
  lib/
    db.ts             # Prisma client singleton (driver-adapter setup)
    site-content.ts   # interim static content, shaped to mirror the DB
                       # models it will be replaced by once the CMS ships
    cn.ts             # className merge helper
  generated/prisma/   # generated Prisma client (gitignored, regenerate with db:generate)
```

## Environment variables

See `.env.example` for the full list. Everything is optional except
`DATABASE_URL` and `AUTH_SECRET` — features like email sending, Stripe, and
the AI concierge are feature-detected and simply stay inactive until their
keys are set.

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
- `ADMIN_GUIDE.md`, `DEPLOYMENT.md`, `SEO_GUIDE.md` — stubs for now, filled
  in as the admin dashboard, deployment pipeline, and SEO tooling are built
