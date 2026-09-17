import { Link } from "next-view-transitions";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { NewOutreachContactForm } from "@/components/admin/NewOutreachContactForm";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PERMISSIONS, hasPageAccess } from "@/lib/permissions";
import { OUTREACH_STATUS_LABELS, OUTREACH_STATUS_TONES } from "@/lib/status";

async function getContacts() {
  try {
    const contacts = await db.outreachContact.findMany({
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { activities: true } } },
    });
    return { ok: true as const, contacts };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminOutreachPage() {
  if (!(await hasPageAccess(PERMISSIONS.MARKETING_MANAGE))) {
    return <AccessRestricted label="outreach contacts" />;
  }

  const data = await getContacts();

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage
          outreach contacts here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Outreach</h1>
      <p className="mt-1 text-sm text-ink-400">
        Track local partnerships and backlink outreach — venues, schools, chambers of commerce, and
        bloggers. Log each call or email as an activity on a contact&apos;s page.
      </p>

      <div className="mt-6 space-y-2">
        {data.contacts.map((contact) => (
          <Link
            key={contact.id}
            href={`/admin/outreach/${contact.id}`}
            className="flex items-center justify-between gap-4 rounded-2xl border border-ink-900/8 bg-white p-4 hover:border-rodeo-200"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink-900">{contact.organization}</p>
              <p className="truncate text-xs text-ink-400">
                {contact.category || "Uncategorized"}
                {contact.contactName ? ` · ${contact.contactName}` : ""}
                {contact._count.activities > 0
                  ? ` · ${contact._count.activities} activit${contact._count.activities === 1 ? "y" : "ies"}`
                  : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Badge tone={OUTREACH_STATUS_TONES[contact.status]}>
                {OUTREACH_STATUS_LABELS[contact.status]}
              </Badge>
              <ChevronRight className="h-4 w-4 text-ink-300" />
            </div>
          </Link>
        ))}
        {data.contacts.length === 0 && (
          <p className="text-sm text-ink-400">No outreach contacts yet. Add the first one below.</p>
        )}
        <NewOutreachContactForm />
      </div>
    </div>
  );
}
