import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { business } from "@/lib/site-content";

type Highlight = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function EventLandingTemplate({
  eyebrow,
  title,
  intro,
  highlights,
  ctaLabel = "Start Your Order",
}: {
  eyebrow: string;
  title: string;
  intro: string;
  highlights: Highlight[];
  ctaLabel?: string;
}) {
  return (
    <>
      <section className="bg-ink-900 py-16 text-cream-50 md:py-24">
        <Container>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-400">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-6xl">{title}</h1>
            <p className="mt-5 text-lg text-cream-100/80">{intro}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/catering#builder" size="lg">
                {ctaLabel}
              </Button>
              <Button
                href={business.phoneHref}
                size="lg"
                variant="ghost"
                className="border-cream-50/25 text-cream-50 hover:border-cream-50/60"
              >
                Call {business.phone}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((h) => (
              <div key={h.title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rodeo-50 text-rodeo-600">
                  <h.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-ink-900">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{h.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-cream-100 py-20">
        <Container>
          <div className="rounded-3xl bg-white p-10 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-ink-400">
              Tell us your guest count and date — our catering team will
              confirm availability and put together a quote.
            </p>
            <Button href="/catering#builder" size="lg" className="mt-6">
              {ctaLabel}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
