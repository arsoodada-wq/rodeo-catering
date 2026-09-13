"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PERMISSIONS, requirePermission } from "@/lib/permissions";
import { slugify } from "@/lib/slugify";

const statusSchema = z.enum(["DRAFT", "PUBLISHED"]);

function revalidatePublicPages(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
}

function parseTags(raw: string | undefined) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

const createSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().optional(),
  content: z.string().optional(),
});

export async function createBlogPost(input: z.infer<typeof createSchema>) {
  const permission = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const slug = slugify(parsed.data.title);
  if (!slug) return { ok: false as const, error: "Title must contain at least one letter or number." };

  const existing = await db.blogPost.findUnique({ where: { slug } });
  if (existing) {
    return { ok: false as const, error: "A post with this title already exists — try a different title." };
  }

  const session = await auth();
  const authorId = (session?.user as { id?: string } | undefined)?.id;

  try {
    const created = await db.blogPost.create({
      data: {
        title: parsed.data.title,
        slug,
        category: parsed.data.category || undefined,
        content: parsed.data.content || "",
        authorId: authorId || undefined,
        status: "DRAFT",
      },
    });
    revalidatePublicPages();
    return { ok: true as const, id: created.id };
  } catch {
    return { ok: false as const, error: "Could not create this post." };
  }
}

const updateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  category: z.string().optional(),
  tags: z.string().optional(), // comma-separated in the form
  content: z.string().optional(),
  featuredImageId: z.string().nullable().optional(),
  ogImageId: z.string().nullable().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  status: statusSchema,
});

export async function updateBlogPost(input: z.infer<typeof updateSchema>) {
  const permission = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const slug = slugify(parsed.data.slug);
  if (!slug) return { ok: false as const, error: "Slug must contain at least one letter or number." };

  const existing = await db.blogPost.findUnique({ where: { slug } });
  if (existing && existing.id !== parsed.data.id) {
    return { ok: false as const, error: "Another post already uses this slug." };
  }

  const current = await db.blogPost.findUnique({ where: { id: parsed.data.id } });
  if (!current) return { ok: false as const, error: "This post no longer exists." };

  // Preserve the original publish date across draft/republish cycles; only
  // stamp it the first time a post actually goes live.
  const publishedAt =
    parsed.data.status === "PUBLISHED" && !current.publishedAt ? new Date() : current.publishedAt;

  try {
    await db.blogPost.update({
      where: { id: parsed.data.id },
      data: {
        title: parsed.data.title,
        slug,
        category: parsed.data.category || undefined,
        tags: parseTags(parsed.data.tags),
        content: parsed.data.content || "",
        featuredImageId: parsed.data.featuredImageId || null,
        ogImageId: parsed.data.ogImageId || null,
        seoTitle: parsed.data.seoTitle || undefined,
        seoDescription: parsed.data.seoDescription || undefined,
        canonicalUrl: parsed.data.canonicalUrl || undefined,
        status: parsed.data.status,
        publishedAt,
      },
    });
    revalidatePublicPages(slug);
    if (current.slug !== slug) revalidatePublicPages(current.slug);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not save this post." };
  }
}

const deleteSchema = z.object({ id: z.string().min(1) });

export async function deleteBlogPost(input: z.infer<typeof deleteSchema>) {
  const permission = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid request." };

  try {
    const deleted = await db.blogPost.delete({ where: { id: parsed.data.id } });
    revalidatePublicPages(deleted.slug);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not delete this post." };
  }
}
