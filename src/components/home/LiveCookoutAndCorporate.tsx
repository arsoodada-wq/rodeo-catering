import { Flame, Briefcase, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function LiveCookoutAndCorporate() {
  return (
    <section className="py-20">
      <Container>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-rodeo-500 p-10 text-white">
            <Flame className="h-8 w-8" />
            <h3 className="mt-5 text-2xl font-extrabold tracking-tight">
              Live Cookout Catering
            </h3>
            <p className="mt-3 text-white/85">
              Our team cooks fresh, right at your event — an interactive
              food experience that turns catering into part of the show.
              A standout option for birthdays, graduations, and community
              events.
            </p>
            <Button
              href="/live-cookout-catering"
              variant="secondary"
              className="mt-6 bg-white text-rodeo-600 hover:bg-cream-100"
            >
              Explore Live Cookout Catering <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-3xl bg-ink-900 p-10 text-cream-50">
            <Briefcase className="h-8 w-8 text-rodeo-400" />
            <h3 className="mt-5 text-2xl font-extrabold tracking-tight">
              Corporate Catering
            </h3>
            <p className="mt-3 text-cream-100/80">
              Office lunches, meetings, and employee appreciation days —
              ordered in minutes, delivered ready to serve. Set up recurring
              catering for your team.
            </p>
            <Button href="/corporate-catering" className="mt-6">
              Plan Your Office Catering <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
