"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { business } from "@/lib/site-content";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Public site error boundary caught:", error);
  }, [error]);

  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">Error</p>
      <h1 className="mx-auto mt-2 max-w-lg text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
        Something went wrong on our end.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-ink-400">
        Nothing you did caused this. Try again, or call us directly at{" "}
        <a href={business.phoneHref} className="font-semibold text-rodeo-600">
          {business.phone}
        </a>{" "}
        and we&apos;ll help right away.
      </p>
      <Button onClick={reset} size="lg" className="mt-8">
        Try Again
      </Button>
    </Container>
  );
}
