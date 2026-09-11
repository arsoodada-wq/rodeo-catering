import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { formatEventDate } from "@/lib/format";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PERMISSIONS, hasPageAccess } from "@/lib/permissions";

async function getLeads() {
  try {
    const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
    return { ok: true as const, leads };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminLeadsPage() {
  if (!(await hasPageAccess(PERMISSIONS.LEADS_MANAGE))) {
    return <AccessRestricted label="leads" />;
  }

  const data = await getLeads();

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to see leads here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Catering Leads</h1>
      <p className="mt-1 text-sm text-ink-400">
        Every catering wizard submission lands here. Update status as you work each one.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-900/8 bg-white">
        {data.leads.length === 0 ? (
          <p className="p-6 text-sm text-ink-400">
            No leads yet — submissions from the catering wizard will appear here.
          </p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-ink-900/8 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <tr>
                <th className="p-4">Contact</th>
                <th className="p-4">Event</th>
                <th className="p-4">Guests</th>
                <th className="p-4">Date</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/8">
              {data.leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-cream-100/60">
                  <td className="p-4">
                    <Link href={`/admin/leads/${lead.id}`} className="block">
                      <p className="font-semibold text-ink-900 hover:text-rodeo-600">{lead.name}</p>
                      <p className="text-ink-400">{lead.email || lead.phone}</p>
                    </Link>
                  </td>
                  <td className="p-4 text-ink-600">{lead.eventType}</td>
                  <td className="p-4 text-ink-600">{lead.guestCount}</td>
                  <td className="p-4 text-ink-600">
                    {lead.eventDate ? formatEventDate(lead.eventDate) : "—"}
                  </td>
                  <td className="p-4 text-ink-600">{lead.city || "—"}</td>
                  <td className="p-4">
                    <LeadStatusSelect leadId={lead.id} status={lead.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
