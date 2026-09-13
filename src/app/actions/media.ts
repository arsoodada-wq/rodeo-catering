"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { PERMISSIONS, requirePermission } from "@/lib/permissions";

/**
 * Images are stored as data: URIs directly in Media.url rather than in
 * object storage (S3/R2/Vercel Blob/etc) — that field is a Prisma `String`
 * with no length cap (maps to Postgres `text`), so it can already hold one
 * with no schema change. This is a deliberate call for this app's actual
 * scale (a local catering business's handful of menu/blog photos, not a
 * high-volume gallery): it needed a file-upload pipeline that works
 * regardless of which host is eventually chosen, and Postgres is the one
 * piece of infrastructure already guaranteed to exist no matter what that
 * turns out to be. `<img src="...">` renders a data: URI natively, so
 * every existing consumer that already reads `media.url` (BlogPost,
 * MenuItem, Package, AwardRecognition) needs no change at all. If this
 * business ever uploads hundreds of large photos, migrating to real object
 * storage later is a contained change (swap what uploadMedia() writes to
 * `url`) — not a blocker to shipping a working library now.
 */
const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

async function getData() {
  try {
    const media = await db.media.findMany({ orderBy: { uploadedAt: "desc" } });
    return { ok: true as const, media };
  } catch {
    return { ok: false as const };
  }
}

export async function getMediaLibrary() {
  return getData();
}

export async function uploadMedia(formData: FormData) {
  const permission = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false as const, error: "Choose a file to upload." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false as const, error: "Only JPEG, PNG, WebP, GIF, or SVG images are allowed." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ok: false as const, error: "Images must be 4MB or smaller." };
  }

  const altText = String(formData.get("altText") ?? "").trim() || undefined;
  const caption = String(formData.get("caption") ?? "").trim() || undefined;
  const category = String(formData.get("category") ?? "").trim() || undefined;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

    const created = await db.media.create({
      data: {
        filename: file.name,
        url: dataUri,
        altText,
        caption,
        category,
        sizeBytes: file.size,
      },
    });
    revalidatePath("/admin/media");
    return { ok: true as const, id: created.id };
  } catch {
    return { ok: false as const, error: "Could not upload this image." };
  }
}

const updateSchema = z.object({
  id: z.string().min(1),
  altText: z.string().optional(),
  caption: z.string().optional(),
  category: z.string().optional(),
});

export async function updateMedia(input: z.infer<typeof updateSchema>) {
  const permission = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };

  try {
    await db.media.update({
      where: { id: parsed.data.id },
      data: {
        altText: parsed.data.altText || undefined,
        caption: parsed.data.caption || undefined,
        category: parsed.data.category || undefined,
      },
    });
    revalidatePath("/admin/media");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not save this image's details." };
  }
}

const deleteSchema = z.object({ id: z.string().min(1) });

export async function deleteMedia(input: z.infer<typeof deleteSchema>) {
  const permission = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid request." };

  try {
    await db.media.delete({ where: { id: parsed.data.id } });
    revalidatePath("/admin/media");
    return { ok: true as const };
  } catch {
    // Most likely a foreign key constraint — this image is still set as a
    // blog post's / menu item's / package's / award's featured image.
    return {
      ok: false as const,
      error: "Could not delete this image — it may still be in use somewhere.",
    };
  }
}
