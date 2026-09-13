import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { SeoOverrideRow } from "@/components/admin/SeoOverrideRow";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PERMISSIONS, hasPageAccess } from "@/lib/permissions";
import { SEO_MANAGED_PAGES } from "@/lib/seo-pages";
import type { SeoOverride } from "@/lib/seo-overrides";

async function getOverrides() {
  try {
    const settings = await db.siteSetting.findMany({ where: { key: { startsWith: "seo:" } } });
    const map: Record<string, SeoOverride> = {};
    for (const setting of settings) {
      const path = setting.key.slice("seo:".length);
      map[path] = setting.value as SeoOverride;
    }
    return { ok: true as const, overrides: map };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminSeoPage() {
  if (!(await hasPageAccess(PERMISSIONS.CONTENT_MANAGE))) {
    return <AccessRestricted label="page SEO settings" />;
  }

  const data = await getOverrides();

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage page
          SEO settings here.
        </p>
      </div>
    );
  }

  const overrides = data.overrides;

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Page SEO</h1>
      <p className="mt-1 text-sm text-ink-400">
        Override the search-result title and description for each static page. Leave a field
        blank to use the default shown as its placeholder — changes take effect immediately, no
        redeploy needed.
      </p>

      <div className="mt-6 space-y-4">
        {SEO_MANAGED_PAGES.map((page) => (
          <SeoOverrideRow
            key={page.path}
            path={page.path}
            label={page.label}
            defaultTitle={page.defaultTitle}
            defaultDescription={page.defaultDescription}
            overrideTitle={overrides[page.path]?.title}
            overrideDescription={overrides[page.path]?.description}
          />
        ))}
      </div>
    </div>
  );
}
