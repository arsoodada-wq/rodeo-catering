import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { ServiceAreaRow } from "@/components/admin/ServiceAreaRow";
import { NewServiceAreaForm } from "@/components/admin/NewServiceAreaForm";

async function getServiceAreas() {
  try {
    const areas = await db.serviceArea.findMany({ orderBy: [{ active: "desc" }, { city: "asc" }] });
    return { ok: true as const, areas };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminServiceAreasPage() {
  const data = await getServiceAreas();

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage service areas here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Service Areas</h1>
      <p className="mt-1 text-sm text-ink-400">
        Only cities marked Active appear on the public site (footer, catering page, and the
        wizard). Never activate a city until the business has actually confirmed it&apos;s
        served — the site never claims coverage it doesn&apos;t have. After changing this list,
        also check the &quot;Where are you located, and where do you cater?&quot; FAQ on the{" "}
        <a href="/admin/faqs" className="font-semibold text-rodeo-600 underline">
          FAQs page
        </a>{" "}
        — its answer is free text and won&apos;t update itself.
      </p>

      <div className="mt-6 space-y-3">
        {data.areas.map((area) => (
          <ServiceAreaRow
            key={area.id}
            id={area.id}
            city={area.city}
            state={area.state}
            notes={area.notes}
            active={area.active}
            deliveryAvailable={area.deliveryAvailable}
          />
        ))}
        <NewServiceAreaForm />
      </div>
    </div>
  );
}
