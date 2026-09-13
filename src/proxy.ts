import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

// A nonce-based Content-Security-Policy, scoped to /admin/* only (see the
// matcher below) rather than site-wide. It needs a fresh nonce every
// request, which means calling headers() somewhere in the render tree —
// and headers() opts a route out of static generation. /admin/* was
// already fully dynamic anyway (every page there runs an auth/permission
// check), so this costs nothing there. Applying the same approach to the
// public marketing site was tried and reverted: LocalBusinessSchema sits
// in the shared public layout, so calling headers() there silently
// dropped ~15 public pages out of static generation (confirmed via a real
// `next build`) — see next.config.ts for the public site's policy and the
// reasoning for keeping it 'unsafe-inline' instead. No component under
// /admin uses dangerouslySetInnerHTML, so this policy needs no exceptions
// at all — Next's own framework bootstrap scripts pick up the nonce
// automatically from this same header.
function buildAdminCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  // Applied in production only: next dev's Turbopack HMR client opens its
  // own inline script and WebSocket back to the dev server, which this
  // policy would otherwise block mid-development for no real security
  // benefit — localhost isn't this header's threat model.
  const nonce = process.env.NODE_ENV === "production" ? crypto.randomUUID() : null;

  const requestHeaders = new Headers(req.headers);
  if (nonce) requestHeaders.set("x-nonce", nonce);

  // Explicit check rather than the `authorized` callback: if auth fails to
  // resolve for any reason (e.g. missing AUTH_SECRET), isLoggedIn is false
  // and this redirects to login — fails closed, never open, on an admin route.
  let response: NextResponse;
  if (!isLoggedIn && !isLoginPage) {
    response = NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
  } else if (isLoggedIn && isLoginPage) {
    response = NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (nonce) {
    response.headers.set("Content-Security-Policy", buildAdminCsp(nonce));
  }

  return response;
});

export const config = {
  matcher: ["/admin/:path*"],
};
