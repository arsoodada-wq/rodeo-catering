import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { PageEditor } from "@/components/admin/PageEditor";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PERMISSIONS, hasPageAccess } from "@/lib/permissions";
import { parsePageContent } from "@/lib/page-blocks";

async function getPage(id: string) {
  try {
    const page = await db.page.findUnique({ where: { id } });
    return { ok: true as const, page };
  } catch {
    return { ok: false as const, page: null };
  }
}

export default async function AdminPageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await hasPageAccess(PERMISSIONS.CONTENT_MANAGE))) {
    return <AccessRestricted label="standalone pages" />;
  }

  const { id } = await params;
  const data = await getPage(id);

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage this
          page here.
        </p>
      </div>
    );
  }

  if (!data.page) notFound();

  return (
    <div>
      <Link
        href="/admin/pages"
        className="flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-ink-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to pages
      </Link>

      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900">{data.page.title}</h1>

      <div className="mt-6">
        <PageEditor
          id={data.page.id}
          title={data.page.title}
          slug={data.page.slug}
          h1={data.page.h1}
          content={parsePageContent(data.page.content)}
          seoTitle={data.page.seoTitle}
          seoDescription={data.page.seoDescription}
          canonicalUrl={data.page.canonicalUrl}
          noindex={data.page.noindex}
          status={data.page.status}
        />
      </div>
    </div>
  );
}
