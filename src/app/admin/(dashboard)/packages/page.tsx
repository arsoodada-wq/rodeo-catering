import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { PackageRow } from "@/components/admin/PackageRow";

async function getPackages() {
  try {
    const packages = await db.package.findMany({ orderBy: { sortOrder: "asc" } });
    return { ok: true as const, packages };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminPackagesPage() {
  const data = await getPackages();

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage packages here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Catering Packages</h1>
      <p className="mt-1 text-sm text-ink-400">
        A package only appears on the public catering page once it&apos;s marked Active — set a
        price first so customers aren&apos;t quoted nothing.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-900/8 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ink-900/8 text-xs font-semibold uppercase tracking-wide text-ink-400">
            <tr>
              <th className="p-4">Package</th>
              <th className="p-4">Pricing</th>
              <th className="p-4">Guest Range</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {data.packages.map((pkg) => (
              <PackageRow
                key={pkg.id}
                id={pkg.id}
                name={pkg.name}
                basePrice={pkg.basePrice?.toString() ?? null}
                pricePerPerson={pkg.pricePerPerson?.toString() ?? null}
                minGuests={pkg.minGuests}
                maxGuests={pkg.maxGuests}
                active={pkg.active}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
