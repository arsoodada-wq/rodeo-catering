import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { business, award } from "@/lib/site-content";
import { resolvePageMetadata } from "@/lib/seo-overrides";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata("/about");
}

export default function AboutPage() {
  return (
    <Container className="py-16 md:py-20">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">About</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
          Fresh food, made from scratch, now for your event.
        </h1>

        <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-2xl">
          <Image
            src="/images/rodeo/storefront.jpg"
            alt="The Rodeo Burgers and Chicken storefront in Worth, IL"
            fill
            sizes="(min-width: 768px) 672px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="mt-6 space-y-4 text-ink-600">
          <p>
            Rodeo Burgers and Chicken is based at {business.address.street},{" "}
            {business.address.city}, {business.address.state} {business.address.zip}.
            Our menu is built around handmade burgers, hot sandwiches, and
            other meals cooked fresh every day — using local ingredients and
            made-from-scratch sauces and seasoning blends.
          </p>
          <p>
            Our smash burgers start with 100% Angus beef, hand-formed and
            smashed on a hot grill until the edges get crispy — no frozen
            patties. That same food and technique is what we bring to
            catering: the same menu our regular customers love, scaled for
            your event.
          </p>
          <p>{award.blurb}</p>
        </div>
        <Button href="/catering#builder" size="lg" className="mt-8">
          Start Your Catering Order
        </Button>
      </div>
    </Container>
  );
}
