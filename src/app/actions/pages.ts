"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { PERMISSIONS, requirePermission } from "@/lib/permissions";
import { slugify } from "@/lib/slugify";
import { pageContentSchema, RESERVED_PAGE_SLUGS } from "@/lib/page-blocks";

const statusSchema = z.enum(["DRAFT", "PUBLISHED"]);

function revalidatePublicPages(slug?: string) {
  revalidatePath("/admin/pages");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/${slug}`);
}

const createSchema = z.object({ title: z.string().min(1, "Title is required") });

export async function createPage(input: z.infer<typeof createSchema>) {
  const permission = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const slug = slugify(parsed.data.title);
  if (!slug) return { ok: false as const, error: "Title must contain at least one letter or number." };
  if (RESERVED_PAGE_SLUGS.has(slug)) {
    return { ok: false as const, error: "This title's URL would collide with an existing page — try a different title." };
  }

  const existing = await db.page.findUnique({ where: { slug } });
  if (existing) {
    return { ok: false as const, error: "A page with this title already exists — try a different title." };
  }

  try {
    const created = await db.page.create({
      data: { title: parsed.data.title, slug, content: [], status: "DRAFT" },
    });
    revalidatePublicPages();
    return { ok: true as const, id: created.id };
  } catch {
    return { ok: false as const, error: "Could not create this page." };
  }
}

const updateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  h1: z.string().optional(),
  content: pageContentSchema,
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  noindex: z.boolean(),
  status: statusSchema,
});

export async function updatePage(input: z.infer<typeof updateSchema>) {
  const permission = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const slug = slugify(parsed.data.slug);
  if (!slug) return { ok: false as const, error: "Slug must contain at least one letter or number." };
  if (RESERVED_PAGE_SLUGS.has(slug)) {
    return { ok: false as const, error: "This URL would collide with an existing page." };
  }

  const existing = await db.page.findUnique({ where: { slug } });
  if (existing && existing.id !== parsed.data.id) {
    return { ok: false as const, error: "Another page already uses this slug." };
  }

  const current = await db.page.findUnique({ where: { id: parsed.data.id } });
  if (!current) return { ok: false as const, error: "This page no longer exists." };

  try {
    await db.page.update({
      where: { id: parsed.data.id },
      data: {
        title: parsed.data.title,
        slug,
        h1: parsed.data.h1 || undefined,
        content: parsed.data.content,
        seoTitle: parsed.data.seoTitle || undefined,
        seoDescription: parsed.data.seoDescription || undefined,
        canonicalUrl: parsed.data.canonicalUrl || undefined,
        noindex: parsed.data.noindex,
        status: parsed.data.status,
      },
    });
    revalidatePublicPages(slug);
    if (current.slug !== slug) revalidatePublicPages(current.slug);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not save this page." };
  }
}

const deleteSchema = z.object({ id: z.string().min(1) });

export async function deletePage(input: z.infer<typeof deleteSchema>) {
  const permission = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid request." };

  try {
    const deleted = await db.page.delete({ where: { id: parsed.data.id } });
    revalidatePublicPages(deleted.slug);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not delete this page." };
  }
}
