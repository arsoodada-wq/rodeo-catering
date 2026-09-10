import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { award } from "@/lib/site-content";
import { Award, Star } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink-900 text-cream-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, var(--color-rodeo-700) 0%, transparent 45%), radial-gradient(circle at 85% 75%, var(--color-rodeo-800) 0%, transparent 50%)",
        }}
      />
      <Container className="relative py-20 md:py-28">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-rodeo-400/30 bg-rodeo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-rodeo-300">
            <Award className="h-3.5 w-3.5" />
            {award.title}
          </div>

          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            Bring the Rodeo
            <br />
            to Your Next Event.
          </h1>

          <p className="mt-6 max-w-lg text-lg text-cream-100/80">
            Fresh smash burgers, crispy chicken, and full event catering from
            Rodeo Burgers and Chicken — for corporate lunches, birthdays,
            graduations, weddings, and everything in between.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Button href="/catering#builder" size="lg">
              Build Your Catering Order
            </Button>
            <Button href="/catering#builder" size="lg" variant="ghost" className="border-cream-50/25 text-cream-50 hover:border-cream-50/60">
              Request a Catering Quote
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-2 text-sm text-cream-100/70">
            <div className="flex" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-rodeo-400 text-rodeo-400" />
              ))}
            </div>
            <span>Trusted by real customers in Worth, IL</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
