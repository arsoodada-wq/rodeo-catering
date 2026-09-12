import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { business } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function SiteNotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">404</p>
      <h1 className="mx-auto mt-2 max-w-lg text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
        We couldn&apos;t find that page.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-ink-400">
        The page you&apos;re looking for may have moved or no longer exists. Start a catering
        order below, or call us directly at{" "}
        <a href={business.phoneHref} className="font-semibold text-rodeo-600">
          {business.phone}
        </a>
        .
      </p>
      <Button href="/catering#builder" size="lg" className="mt-8">
        Start Your Catering Order
      </Button>
    </Container>
  );
}
