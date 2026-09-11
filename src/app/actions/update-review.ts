"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { PERMISSIONS, requirePermission } from "@/lib/permissions";

function revalidatePublicPages() {
  revalidatePath("/");
  revalidatePath("/admin/reviews");
}

const updateSchema = z.object({
  id: z.string().min(1),
  customerName: z.string().min(1, "Customer name is required"),
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().min(1, "Review text is required"),
  source: z.string().optional(),
  active: z.boolean(),
});

export async function updateReview(input: z.infer<typeof updateSchema>) {
  const permission = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await db.review.update({
      where: { id: parsed.data.id },
      data: {
        customerName: parsed.data.customerName,
        rating: parsed.data.rating,
        reviewText: parsed.data.reviewText,
        source: parsed.data.source || undefined,
        active: parsed.data.active,
      },
    });
    revalidatePublicPages();
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not save this review." };
  }
}

const createSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().min(1, "Review text is required"),
  source: z.string().optional(),
});

export async function createReview(input: z.infer<typeof createSchema>) {
  const permission = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await db.review.create({
      data: {
        customerName: parsed.data.customerName,
        rating: parsed.data.rating,
        reviewText: parsed.data.reviewText,
        source: parsed.data.source || undefined,
        active: true,
      },
    });
    revalidatePublicPages();
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not create this review." };
  }
}

const deleteSchema = z.object({ id: z.string().min(1) });

export async function deleteReview(input: z.infer<typeof deleteSchema>) {
  const permission = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid request." };

  try {
    await db.review.delete({ where: { id: parsed.data.id } });
    revalidatePublicPages();
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not delete this review." };
  }
}
