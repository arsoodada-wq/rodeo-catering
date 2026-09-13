import { db } from "@/lib/db";
import { SEO_MANAGED_PAGES } from "@/lib/seo-pages";
import { ogImagePath } from "@/lib/og-image";

export type SeoOverride = { title?: string; description?: string; ogImageId?: string };

function settingKey(path: string) {
  return `seo:${path}`;
}

export async function getSeoOverride(path: string): Promise<SeoOverride | null> {
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: settingKey(path) } });
    if (!setting) return null;
    const value = setting.value as SeoOverride;
    return {
      title: value.title || undefined,
      description: value.description || undefined,
      ogImageId: value.ogImageId || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Every managed static page calls this instead of hardcoding its own
 * title/description, so an admin override at /admin/seo takes effect with
 * no redeploy. `useAbsoluteTitle` is for the homepage only — Next.js's root
 * title template (`"%s | Rodeo Burgers & Chicken Catering"`) applies to any
 * plain string title a page provides, which would double the brand name on
 * a page whose own title already *is* the full branded string (the same
 * bug already fixed once on the blog post page). `{ title: { absolute } }`
 * is the documented way to opt a page out of the template.
 */
export async function resolvePageMetadata(path: string, useAbsoluteTitle = false) {
  const page = SEO_MANAGED_PAGES.find((p) => p.path === path);
  if (!page) {
    throw new Error(`resolvePageMetadata: "${path}" is not a registered SEO_MANAGED_PAGES entry`);
  }

  const override = await getSeoOverride(path);
  const title = override?.title || page.defaultTitle;
  const description = override?.description || page.defaultDescription;
  const ogImage = ogImagePath(override?.ogImageId);

  return {
    title: useAbsoluteTitle ? { absolute: title } : title,
    description,
    // openGraph.title is plain text with no title-template involved (unlike
    // the root `title` field above), so it's safe to always set it here
    // regardless of useAbsoluteTitle.
    openGraph: ogImage ? { title, description, images: [{ url: ogImage }] } : undefined,
  };
}
