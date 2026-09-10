import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Catering Guides",
  description: "Catering planning guides from Rodeo Burgers and Chicken — coming soon.",
};

export default function BlogPage() {
  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">
        Catering Guides
      </p>
      <h1 className="mx-auto mt-2 max-w-lg text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
        Planning guides are coming soon.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-ink-400">
        We&apos;re putting together guides on planning food for parties,
        corporate events, and more. In the meantime, our catering team is
        happy to help directly.
      </p>
      <Button href="/catering#builder" size="lg" className="mt-8">
        Start Your Catering Order
      </Button>
    </Container>
  );
}
