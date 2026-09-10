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
  session: { strategy: "jwt" },
  providers: [],
} satisfies NextAuthConfig;
