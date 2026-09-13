import type { Metadata } from "next";
import { Briefcase, Repeat, Users, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { business } from "@/lib/site-content";
import { resolvePageMetadata } from "@/lib/seo-overrides";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata("/corporate-catering");
}

const useCases = [
  {
    icon: Users,
    title: "Office Lunches",
    description: "Order for the whole team, delivered ready to serve.",
  },
  {
    icon: Briefcase,
    title: "Meetings & Conferences",
    description: "Keep things moving with food that shows up on time.",
  },
  {
    icon: Repeat,
    title: "Recurring Catering",
    description: "Set up a standing order for weekly or monthly team lunches.",
  },
  {
    icon: Clock,
    title: "Employee Appreciation",
    description: "A memorable meal for milestones and team wins.",
  },
];

export default function CorporateCateringPage() {
  return (
    <>
      <section className="bg-ink-900 py-16 text-cream-50 md:py-24">
        <Container>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-400">
              Corporate Catering
            </p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-6xl">
              Office catering that actually shows up good.
            </h1>
            <p className="mt-5 text-lg text-cream-100/80">
              Smash burgers and crispy chicken for your office in Worth, IL
              and the surrounding area — ordered in minutes, ready when your
              meeting starts.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/catering#builder" size="lg">
                Plan Your Office Catering
              </Button>
              <Button href={business.phoneHref} size="lg" variant="ghost" className="border-cream-50/25 text-cream-50 hover:border-cream-50/60">
                Call {business.phone}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((uc) => (
              <div key={uc.title}>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rodeo-50 text-rodeo-600">
                  <uc.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-ink-900">{uc.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-400">{uc.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-cream-100 py-20">
        <Container>
          <div className="rounded-3xl bg-white p-10 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl">
              Ready to set up catering for your team?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-ink-400">
              Tell us your headcount and schedule — our catering team will
              confirm availability and put together a quote.
            </p>
            <Button href="/catering#builder" size="lg" className="mt-6">
              Start Your Order
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
