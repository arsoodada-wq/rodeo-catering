import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { packages as staticPackages } from "@/lib/site-content";

type DisplayPackage = {
  slug: string;
  name: string;
  description: string | null;
  priceLabel: string;
};

async function getActivePackages(): Promise<DisplayPackage[] | null> {
  try {
    const packages = await db.package.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    if (packages.length === 0) return null;

    return packages.map((pkg) => ({
      slug: pkg.slug,
      name: pkg.name,
      description: pkg.description,
      priceLabel: pkg.pricePerPerson
        ? `$${pkg.pricePerPerson.toString()} / person`
        : pkg.basePrice
          ? `$${pkg.basePrice.toString()} base`
          : "Custom quote",
    }));
  } catch {
    return null;
  }
}

export async function PackagesTeaser({ ctaHref = "#builder" }: { ctaHref?: string } = {}) {
  const activePackages = await getActivePackages();

  // Falls back to the static shell list (all "Custom quote") whenever the
  // database isn't reachable or the business hasn't activated any priced
  // packages yet — never shows a price that wasn't actually set in admin.
  const displayPackages: DisplayPackage[] =
    activePackages ??
    staticPackages.map((pkg) => ({
      slug: pkg.slug,
      name: pkg.name,
      description: pkg.description,
      priceLabel: "Custom quote",
    }));

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
            Every package is customizable — use the builder above and our
            team will follow up with a detailed estimate.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayPackages.map((pkg) => (
            <div key={pkg.slug} className="rounded-2xl border border-ink-900/8 bg-white p-6">
              <h3 className="font-bold text-ink-900">{pkg.name}</h3>
              {pkg.description && <p className="mt-2 text-sm text-ink-400">{pkg.description}</p>}
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-rodeo-600">
                {pkg.priceLabel}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Button href={ctaHref} size="lg">
            Get a Quote for Your Event
          </Button>
        </div>
      </Container>
    </section>
  );
}
