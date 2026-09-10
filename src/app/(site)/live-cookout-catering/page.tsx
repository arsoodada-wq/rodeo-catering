import type { Metadata } from "next";
import { Flame, Eye, Users, PartyPopper } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { business } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Live Cookout Catering",
  description:
    "Live cookout catering from Rodeo Burgers and Chicken — our team cooks fresh, on-site, turning your event into a food experience.",
};

const highlights = [
  {
    icon: Flame,
    title: "Cooked Fresh, On-Site",
    description: "The same smash-burger technique from our kitchen, brought to your event.",
  },
  {
    icon: Eye,
    title: "An Interactive Experience",
    description: "Guests get to watch and smell the food coming together — it becomes part of the event.",
  },
  {
    icon: Users,
    title: "Built for a Crowd",
    description: "A standout option for birthdays, graduations, and community gatherings.",
  },
  {
    icon: PartyPopper,
    title: "Something to Remember",
    description: "A more memorable alternative to a standard drop-off tray.",
  },
];

export default function LiveCookoutCateringPage() {
  return (
    <>
      <section className="bg-rodeo-500 py-16 text-white md:py-24">
        <Container>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Live Cookout Catering
            </p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-6xl">
              We cook it fresh, right at your event.
            </h1>
            <p className="mt-5 text-lg text-white/90">
              Our team sets up and cooks on-site — a hands-on, interactive
              food experience for birthdays, graduations, and community
              events.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/catering#builder" size="lg" variant="secondary" className="bg-white text-rodeo-600 hover:bg-cream-100">
                Book a Live Cookout
              </Button>
              <Button href={business.phoneHref} size="lg" variant="ghost" className="border-white/40 text-white hover:border-white">
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
          <div className="rounded-3xl bg-ink-900 p-10 text-center text-cream-50">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Ready to bring the cookout to your event?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-cream-100/80">
              Tell us your date, guest count, and location — our team will
              confirm availability for on-site cooking.
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
