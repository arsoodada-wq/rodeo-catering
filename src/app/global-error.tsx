"use client";

import { useEffect } from "react";

/**
 * The one error boundary that can catch a crash in the root layout itself
 * (a bad font load, a broken provider, etc.) — Next.js requires it to
 * render its own <html>/<body> since it replaces the root layout
 * entirely rather than nesting inside it. Deliberately dependency-free
 * (no site-content, no Tailwind-dependent components) so this fallback
 * can't itself fail for the same reason the root layout did.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Root layout error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Something went wrong.</h1>
        <p style={{ maxWidth: "24rem", color: "#666" }}>
          {/* Phone number hardcoded, not imported from site-content.ts — this
              page must survive even if that module is part of what broke. */}
          Please try again, or call us directly at (708) 608-8401.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "0.5rem",
            borderRadius: "9999px",
            padding: "0.625rem 1.5rem",
            fontWeight: 600,
            color: "white",
            background: "#db594b",
            border: "none",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
