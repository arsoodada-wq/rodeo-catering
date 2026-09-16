# Deployment

## Architecture

- **App hosting:** Vercel (Next.js App Router + Turbopack) — import to be
  done by the business owner
- **Database:** self-hosted PostgreSQL on a Hostinger VPS (KVM 2,
  `srv1370387.hstgr.cloud`), reached only through PgBouncer — **this part
  is done and verified**, see below
- **Domain:** configurable via `NEXT_PUBLIC_SITE_URL` / `AUTH_URL` — no
  domain is hard-coded anywhere in the app. Buy the domain at any
  registrar and point it at Vercel (Vercel's project settings show the
  exact DNS records/nameservers once the domain is added there)

## Database: done (2026-09-16)

Set up directly on the VPS via its Hostinger hPanel web console (no SSH
key or root password ever handled in this repo or by an AI session — the
web console authenticates through the already-logged-in hPanel session):

- PostgreSQL 16, `listen_addresses` left at its default (`localhost`) —
  **never reachable from the internet directly**
- A dedicated `rodeoapp` database user (not the `postgres` superuser)
  owns the `rodeocatering` database
- **PgBouncer** on port `6432` is the only thing the internet can reach —
  `pool_mode = transaction`, which is what makes this safe to pair with
  Vercel's serverless functions (each invocation can open its own
  Postgres connection; without a pooler in front, a moderate traffic
  spike can exhaust Postgres's connection limit — a well-known
  serverless-plus-traditional-Postgres pitfall)
- TLS via a real Let's Encrypt certificate for the VPS's own hostname
  (not self-signed — the hostname already resolves publicly, so
  `certbot certonly --standalone` got a trusted cert directly). Since
  PgBouncer runs as the `postgres` user and Let's Encrypt's own
  `/etc/letsencrypt` tree is root-only, a deploy hook
  (`/etc/letsencrypt/renewal-hooks/deploy/pgbouncer-certs.sh`) copies the
  renewed cert/key into `/etc/pgbouncer/certs/` with the right ownership
  every time certbot renews — without this, PgBouncer would silently
  start failing to boot again after the certificate's first ~60-day
  renewal
- `ufw` firewall: only SSH and `6432/tcp` are allowed in; everything else
  is denied, including Postgres's own `5432` (redundant with it already
  being localhost-only, but defense in depth)
- Schema migrated with the project's real `prisma/migrations/` (not
  `db push` — this is the same migration history local dev runs) and
  seeded with `npm run db:seed`, both run **from a developer machine
  against the public PgBouncer endpoint** (`prisma migrate deploy`
  worked cleanly through the transaction-pooled connection for this
  project's migrations — no advisory-lock conflicts hit, though that's
  not guaranteed for every possible migration and is worth a quick check
  if a future migration behaves unexpectedly against a pooler)
- Verified end-to-end: all 33 tables present, owned by `rodeoapp`; the
  seeded admin account, 15 menu items, and 12 active service areas all
  confirmed via direct query against the live remote database — zero
  leftover dev/test data carried over (the local dev database's only
  "real" rows were demo leads from earlier testing, not actual customer
  data, so a fresh migrate+seed was the right move, not a literal
  data copy)

**Backups:** the VPS already has Hostinger's own weekly automated
snapshots (2 exist as of this setup). That covers disaster recovery at
the whole-VPS level; a proper logical `pg_dump` backup routine (e.g. a
cron job pushing a nightly dump somewhere off-VPS) is not set up and
would be a reasonable follow-up once there's real customer data worth
protecting beyond what a weekly VPS snapshot already covers.

**The production `DATABASE_URL`** (host, PgBouncer port, the `rodeoapp`
password) is not written down anywhere in this repo — it was handed to
the business owner directly in chat to paste into Vercel's environment
variables. If it's ever lost, reset the `rodeoapp` password directly on
the VPS (`sudo -u postgres psql -c "ALTER USER rodeoapp WITH PASSWORD '...';"`
then update `/etc/pgbouncer/userlist.txt` the same way Stage 4 of the
original setup built it) rather than storing it in a file.

## Before the first Vercel deploy

1. Set every variable in `.env.example` in Vercel's project environment
   settings (production values, not local `.env`) — `DATABASE_URL` is the
   one above; everything else follows the comments in that file
2. Confirm `AUTH_SECRET` is a freshly generated production secret
   (`npx auth secret` or `openssl rand -base64 32`), not the one from
   local `.env`
3. Database schema/seed is already done (see above) — no migration step
   needed as part of the Vercel deploy itself

## Immediately after the first deploy

1. **Log in and change the admin password.** The seeded account
   (`admin@rodeocatering.local`) still uses the same password as local
   dev — change it via **My Account** in the admin sidebar the moment the
   site is reachable
2. Set `NEXT_PUBLIC_SITE_URL` to the real domain once it's connected (not
   just Vercel's `*.vercel.app` preview URL) and redeploy — this feeds
   `sitemap.xml`, `robots.txt`, canonical URLs, and the `og:image`/JSON-LD
   absolute URLs; leaving it wrong after the domain goes live means the
   sitemap and structured data still claim the wrong origin
3. Enable the daily follow-up reminder email —
   `.github/workflows/follow-up-reminders.yml` already exists and runs
   daily, but does nothing until two GitHub repository secrets are set
   (Settings -> Secrets and variables -> Actions):
   - `SITE_URL` — the real deployed URL, no trailing slash
   - `CRON_SECRET` — must match the `CRON_SECRET` env var set on Vercel
     (generate with `openssl rand -hex 32`)

   Once both are set, trigger the workflow manually once (Actions tab ->
   "Follow-up reminders" -> "Run workflow") to confirm it reaches the
   site before waiting for its next scheduled run.
