import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { business } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

/**
 * Only reachable for a URL with no matching route at all — Next.js can't
 * wrap that case in (site)/layout.tsx's header/footer (there's no
 * matching segment tree to attach it to), so this stays intentionally
 * bare rather than half-rendering a broken-looking page. notFound() calls
 * from within an actual page (e.g. /blog/[slug]) use
 * (site)/not-found.tsx instead, which does get the full site chrome.
 */
export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900">
        We couldn&apos;t find that page.
      </h1>
      <p className="mt-4 max-w-md text-ink-400">
        Call us at{" "}
        <a href={business.phoneHref} className="font-semibold text-rodeo-600">
          {business.phone}
        </a>{" "}
        or head back to the homepage.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-rodeo-500 px-6 py-3 text-sm font-semibold text-white hover:bg-rodeo-600"
      >
        Back to Homepage
      </Link>
    </div>
  );
}
