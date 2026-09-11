import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { AwardRow } from "@/components/admin/AwardRow";
import { NewAwardForm } from "@/components/admin/NewAwardForm";

async function getAwards() {
  try {
    const awards = await db.awardRecognition.findMany({ orderBy: { sortOrder: "asc" } });
    return { ok: true as const, awards };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminAwardsPage() {
  const data = await getAwards();

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage awards here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Awards & Recognition</h1>
      <p className="mt-1 text-sm text-ink-400">
        Only awards the business actually received — never invent one. The first active award
        flagged for the homepage is what shows in the hero badge.
      </p>

      <div className="mt-6 space-y-4">
        {data.awards.map((award) => (
          <AwardRow
            key={award.id}
            id={award.id}
            organization={award.organization}
            title={award.title}
            description={award.description}
            sourceUrl={award.sourceUrl}
            displayHomepage={award.displayHomepage}
            displayCateringPages={award.displayCateringPages}
            active={award.active}
          />
        ))}
        <NewAwardForm />
      </div>
    </div>
  );
}
