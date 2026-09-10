import { Container } from "@/components/ui/Container";
import { processSteps } from "@/lib/site-content";

export function HowItWorks() {
  return (
    <section className="bg-cream-100 py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">
            How Catering Works
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
            From idea to event in five simple steps.
          </h2>
        </div>

        <ol className="mt-12 grid gap-8 md:grid-cols-5">
          {processSteps.map((step, i) => (
            <li key={step.title} className="relative">
              <span className="text-4xl font-extrabold text-rodeo-200">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-base font-bold text-ink-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{step.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
