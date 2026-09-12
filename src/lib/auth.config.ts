import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe config: no Credentials provider here (it needs bcrypt + Prisma,
 * both Node-only). Middleware runs on the Edge runtime, so it imports only
 * this file — the full config with providers lives in auth.ts and is used
 * by route handlers / server components instead.
 *
 * Route gating itself lives in middleware.ts as an explicit check rather
 * than the `authorized` callback: when AUTH_SECRET is missing, Auth.js logs
 * a MissingSecret error but does not necessarily block the request, which
 * would fail OPEN on an admin route. Checking `req.auth` directly in
 * middleware defaults to "not logged in" (redirect to login) in that same
 * failure case, which fails CLOSED instead.
 */
export const authConfig = {
  pages: { signIn: "/admin/login" },
  // Auth.js's default is 30 days, which is long for a session that can
  // create other admin accounts and view customer contact info. A week is
  // a reasonable default for how often the business's own staff sign in;
  // not a business-confirmed policy, just a safer default than "unset".
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  providers: [],
} satisfies NextAuthConfig;
