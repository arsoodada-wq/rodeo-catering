import { Link } from "next-view-transitions";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { OutreachContactEditor } from "@/components/admin/OutreachContactEditor";
import { OutreachActivityLog } from "@/components/admin/OutreachActivityLog";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PERMISSIONS, hasPageAccess } from "@/lib/permissions";

async function getContact(id: string) {
  try {
    const contact = await db.outreachContact.findUnique({
      where: { id },
      include: { activities: { orderBy: { date: "desc" } } },
    });
    return { ok: true as const, contact };
  } catch {
    return { ok: false as const, contact: null };
  }
}

export default async function AdminOutreachContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await hasPageAccess(PERMISSIONS.MARKETING_MANAGE))) {
    return <AccessRestricted label="outreach contacts" />;
  }

  const { id } = await params;
  const data = await getContact(id);

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage this
          contact here.
        </p>
      </div>
    );
  }

  if (!data.contact) notFound();

  return (
    <div>
      <Link
        href="/admin/outreach"
        className="flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-ink-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to outreach
      </Link>

      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900">
        {data.contact.organization}
      </h1>

      <div className="mt-6">
        <OutreachContactEditor
          id={data.contact.id}
          organization={data.contact.organization}
          website={data.contact.website}
          category={data.contact.category}
          contactName={data.contact.contactName}
          email={data.contact.email}
          phone={data.contact.phone}
          status={data.contact.status}
          backlinkUrl={data.contact.backlinkUrl}
          notes={data.contact.notes}
        />
      </div>

      <OutreachActivityLog outreachContactId={data.contact.id} activities={data.contact.activities} />
    </div>
  );
}
