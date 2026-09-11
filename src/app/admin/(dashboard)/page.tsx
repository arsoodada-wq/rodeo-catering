import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LEAD_STATUS_LABELS, LEAD_STATUS_TONES } from "@/lib/status";

async function getDashboardData() {
  try {
    const [total, byStatus, recent] = await Promise.all([
      db.lead.count(),
      db.lead.groupBy({ by: ["status"], _count: true }),
      db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);
    return { ok: true as const, total, byStatus, recent };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  if (!data.ok) {
    return (
      <Card className="border-rodeo-200 bg-rodeo-50">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> in
          your environment, then run <code className="rounded bg-white/60 px-1 py-0.5">npm run db:migrate</code> to see live data here.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Leads" value={data.total} />
        {Object.entries(LEAD_STATUS_LABELS).map(([key, label]) => {
          const count = data.byStatus.find((s) => s.status === key)?._count ?? 0;
          return <StatCard key={key} label={label} value={count} />;
        })}
      </div>

      <Card padding="none" className="mt-10">
        <div className="flex items-center justify-between border-b border-ink-900/8 p-5">
          <h2 className="font-bold text-ink-900">Recent Leads</h2>
          <Link href="/admin/leads" className="flex items-center gap-1 text-sm font-semibold text-rodeo-600 hover:text-rodeo-700">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {data.recent.length === 0 ? (
          <p className="p-5 text-sm text-ink-400">No leads yet — they&apos;ll show up here as they come in through the catering wizard.</p>
        ) : (
          <ul className="divide-y divide-ink-900/8">
            {data.recent.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between p-5 text-sm">
                <div>
                  <p className="font-semibold text-ink-900">{lead.name}</p>
                  <p className="text-ink-400">
                    {lead.eventType} · {lead.guestCount} guests
                  </p>
                </div>
                <Badge tone={LEAD_STATUS_TONES[lead.status] ?? "neutral"}>
                  {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-2xl font-extrabold text-ink-900">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
    </Card>
  );
}
