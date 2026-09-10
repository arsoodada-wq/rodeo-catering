import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { packages } from "@/lib/site-content";

export function PackagesTeaser() {
  return (
    <section id="packages" className="bg-cream-100 py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">
            Catering Packages
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
            A starting point for every event.
          </h2>
          <p className="mt-4 text-ink-400">
            Every package is customizable, and pricing is quoted per event —
            use the builder above and our team will follow up with a
            detailed estimate.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <div key={pkg.slug} className="rounded-2xl border border-ink-900/8 bg-white p-6">
              <h3 className="font-bold text-ink-900">{pkg.name}</h3>
              <p className="mt-2 text-sm text-ink-400">{pkg.description}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-rodeo-600">
                Custom quote
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Button href="#builder" size="lg">
            Get a Quote for Your Event
          </Button>
        </div>
      </Container>
    </section>
  );
}
