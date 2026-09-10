import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { eventTypes } from "@/lib/site-content";

export function EventTypes() {
  return (
    <section className="bg-cream-100 py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">
              Every Occasion
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
              What are you celebrating?
            </h2>
          </div>
          <Link
            href="/catering#builder"
            className="hidden items-center gap-1.5 text-sm font-semibold text-rodeo-600 hover:text-rodeo-700 sm:flex"
          >
            Start planning your event <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {eventTypes.map((event) => (
            <Link
              key={event.key}
              href="/catering#builder"
              className="group rounded-2xl border border-ink-900/8 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-rodeo-200 hover:shadow-lg hover:shadow-rodeo-900/5"
            >
              <h3 className="text-lg font-bold text-ink-900 group-hover:text-rodeo-600">
                {event.label}
              </h3>
              <p className="mt-2 text-sm text-ink-400">{event.description}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
