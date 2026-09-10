# Admin Guide

_Stub — the `/admin` dashboard is not built yet (see `PROJECT_STATUS.md`,
Phase 7). This file will be filled in with real, screenshot-backed
instructions once it exists so the business owner can run the site without
a developer, per the project's core requirement._

## What will eventually live here

- Logging in and roles (Super Admin / Manager / Staff / Marketing)
- Managing menu items, packages, and pricing
- Managing service areas and delivery fees
- Managing leads, quotes, and orders
- Managing FAQs, reviews, and awards/recognition
- Managing blog posts and landing pages
- Managing SEO metadata per page
- Managing social content calendar and outreach CRM
- Managing users and permissions

## In the meantime

All business data lives in Postgres via Prisma. Until the admin UI exists,
changes are made directly:

```bash
npm run db:studio
```

This opens Prisma Studio, a visual database browser, at
`http://localhost:5555` — usable for basic edits (e.g., setting a package's
price) but not a substitute for the real dashboard.
