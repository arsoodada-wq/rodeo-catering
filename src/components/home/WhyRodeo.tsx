import { Flame, HandPlatter, Users, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";

const points = [
  {
    icon: Flame,
    title: "Made Fresh, Never Frozen",
    description:
      "Our smash burgers are 100% Angus beef, hand-formed and smashed to order — the same food you'd get in the restaurant, scaled for your event.",
  },
  {
    icon: HandPlatter,
    title: "Pickup, Drop-Off, or Full Service",
    description:
      "From a simple office lunch drop-off to a fully staffed event, choose the level of service that fits your occasion.",
  },
  {
    icon: Users,
    title: "Built for Groups of Any Size",
    description:
      "Office lunches, backyard cookouts, or 200-person celebrations — our catering menu scales with your guest count.",
  },
  {
    icon: Sparkles,
    title: "A Memorable Food Experience",
    description:
      "Bold flavors and a fun, rodeo-branded presentation that gives your event something to talk about.",
  },
];

export function WhyRodeo() {
  return (
    <section className="py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">
            Why Rodeo Catering
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
            Restaurant-quality food, built for your event.
          </h2>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((point) => (
            <div key={point.title}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rodeo-50 text-rodeo-600">
                <point.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-ink-900">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{point.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
