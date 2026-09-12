"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Admin error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream-100 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">Error</p>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
        Something went wrong loading this page.
      </h1>
      <p className="max-w-sm text-sm text-ink-500">
        Try again, or head back to the dashboard. If this keeps happening, check the server logs.
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-rodeo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rodeo-600"
        >
          Try Again
        </button>
        <a
          href="/admin"
          className="rounded-full border border-ink-900/15 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:border-ink-900/40"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
