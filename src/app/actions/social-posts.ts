"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { PERMISSIONS, requirePermission } from "@/lib/permissions";

const platformSchema = z.enum(["INSTAGRAM", "FACEBOOK", "TIKTOK", "YOUTUBE", "YOUTUBE_SHORTS"]);
const statusSchema = z.enum(["IDEA", "DRAFT", "APPROVED", "SCHEDULED", "PUBLISHED"]);

const baseFields = {
  platform: platformSchema,
  category: z.string().optional(),
  topic: z.string().optional(),
  hook: z.string().optional(),
  caption: z.string().optional(),
  cta: z.string().optional(),
  hashtags: z.string().optional(), // comma-separated in the form, split before saving
  videoConcept: z.string().optional(),
  shotList: z.string().optional(),
  status: statusSchema,
  scheduledDate: z.string().optional(), // yyyy-mm-dd from a date input, or ""
  publishedUrl: z.string().optional(),
  notes: z.string().optional(),
};

function parseHashtags(raw: string | undefined) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseScheduledDate(raw: string | undefined) {
  if (!raw) return null;
  const date = new Date(`${raw}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

const createSchema = z.object(baseFields);

export async function createSocialPost(input: z.infer<typeof createSchema>) {
  const permission = await requirePermission(PERMISSIONS.MARKETING_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await db.socialPost.create({
      data: {
        platform: parsed.data.platform,
        category: parsed.data.category || undefined,
        topic: parsed.data.topic || undefined,
        hook: parsed.data.hook || undefined,
        caption: parsed.data.caption || undefined,
        cta: parsed.data.cta || undefined,
        hashtags: parseHashtags(parsed.data.hashtags),
        videoConcept: parsed.data.videoConcept || undefined,
        shotList: parsed.data.shotList || undefined,
        status: parsed.data.status,
        scheduledDate: parseScheduledDate(parsed.data.scheduledDate),
        publishedUrl: parsed.data.publishedUrl || undefined,
        notes: parsed.data.notes || undefined,
      },
    });
    revalidatePath("/admin/social");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not create this post." };
  }
}

const updateSchema = z.object({ id: z.string().min(1), ...baseFields });

export async function updateSocialPost(input: z.infer<typeof updateSchema>) {
  const permission = await requirePermission(PERMISSIONS.MARKETING_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await db.socialPost.update({
      where: { id: parsed.data.id },
      data: {
        platform: parsed.data.platform,
        category: parsed.data.category || undefined,
        topic: parsed.data.topic || undefined,
        hook: parsed.data.hook || undefined,
        caption: parsed.data.caption || undefined,
        cta: parsed.data.cta || undefined,
        hashtags: parseHashtags(parsed.data.hashtags),
        videoConcept: parsed.data.videoConcept || undefined,
        shotList: parsed.data.shotList || undefined,
        status: parsed.data.status,
        scheduledDate: parseScheduledDate(parsed.data.scheduledDate),
        publishedUrl: parsed.data.publishedUrl || undefined,
        notes: parsed.data.notes || undefined,
      },
    });
    revalidatePath("/admin/social");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not save this post." };
  }
}

const deleteSchema = z.object({ id: z.string().min(1) });

export async function deleteSocialPost(input: z.infer<typeof deleteSchema>) {
  const permission = await requirePermission(PERMISSIONS.MARKETING_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid request." };

  try {
    await db.socialPost.delete({ where: { id: parsed.data.id } });
    revalidatePath("/admin/social");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not delete this post." };
  }
}
