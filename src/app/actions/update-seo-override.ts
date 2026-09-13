"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { PERMISSIONS, requirePermission } from "@/lib/permissions";
import { SEO_MANAGED_PAGES } from "@/lib/seo-pages";

const schema = z.object({
  path: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  ogImageId: z.string().nullable().optional(),
});

export async function updateSeoOverride(input: z.infer<typeof schema>) {
  const permission = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  if (!SEO_MANAGED_PAGES.some((p) => p.path === parsed.data.path)) {
    return { ok: false as const, error: "Unknown page." };
  }

  const key = `seo:${parsed.data.path}`;
  const title = parsed.data.title?.trim() || undefined;
  const description = parsed.data.description?.trim() || undefined;
  const ogImageId = parsed.data.ogImageId || undefined;

  try {
    if (!title && !description && !ogImageId) {
      // Everything cleared — remove the override entirely rather than
      // storing an empty one, so the page falls back to its real default.
      await db.siteSetting.deleteMany({ where: { key } });
    } else {
      await db.siteSetting.upsert({
        where: { key },
        create: {
          key,
          value: { title, description, ogImageId },
          description: `SEO title/description override for ${parsed.data.path}`,
        },
        update: { value: { title, description, ogImageId } },
      });
    }
    revalidatePath(parsed.data.path);
    revalidatePath("/admin/seo");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not save this page's SEO settings." };
  }
}
