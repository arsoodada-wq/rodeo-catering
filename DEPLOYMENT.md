# Deployment

_Stub — production deployment hasn't been configured yet (see
`PROJECT_STATUS.md`, Phase 12). Notes below are the intended shape, not a
tested runbook yet._

## Intended setup

- **Hosting:** Vercel (best fit for Next.js App Router + Turbopack)
- **Database:** the same Neon/Supabase Postgres project used in
  development, or a separate production project with its own
  `DATABASE_URL`
- **Domain:** configurable via `NEXT_PUBLIC_SITE_URL` / `AUTH_URL` — no
  domain is hard-coded anywhere in the app. Set the real catering domain
  once the business confirms it (see `PROJECT_STATUS.md`)

## Before the first deploy

1. Set every variable in `.env.example` in the hosting provider's
   environment settings (production values, not `.env`)
2. Run `npm run db:migrate` (via `prisma migrate deploy` in CI/CD, not
   `migrate dev`) against the production database
3. Run `npm run db:seed` only if you want the verified starter data —
   review it first, it's meant as a baseline, not a full production dataset
4. Confirm `AUTH_SECRET` is a freshly generated production secret, not the
   one from local `.env`

## After the first deploy: enable the daily follow-up reminder email

`.github/workflows/follow-up-reminders.yml` already exists and runs daily,
but does nothing until two GitHub repository secrets are set (Settings ->
Secrets and variables -> Actions):

- `SITE_URL` — the real deployed URL, no trailing slash
- `CRON_SECRET` — must match the `CRON_SECRET` env var set on the
  deployment itself (generate with `openssl rand -hex 32`)

Once both are set, trigger the workflow manually once (Actions tab ->
"Follow-up reminders" -> "Run workflow") to confirm it reaches the site
before waiting for its next scheduled run.

## Backups

Use your Postgres provider's built-in backup/point-in-time-recovery
(Neon and Supabase both offer this on paid tiers) — not covered by this
repo.
