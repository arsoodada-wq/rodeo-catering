"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { PERMISSIONS, requirePermission } from "@/lib/permissions";

function revalidatePublicPages() {
  revalidatePath("/");
  revalidatePath("/catering");
  revalidatePath("/admin/awards");
}

const updateSchema = z.object({
  id: z.string().min(1),
  organization: z.string().min(1, "Organization is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  sourceUrl: z.string().optional(),
  displayHomepage: z.boolean(),
  displayCateringPages: z.boolean(),
  active: z.boolean(),
});

export async function updateAward(input: z.infer<typeof updateSchema>) {
  const permission = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await db.awardRecognition.update({
      where: { id: parsed.data.id },
      data: {
        organization: parsed.data.organization,
        title: parsed.data.title,
        description: parsed.data.description || undefined,
        sourceUrl: parsed.data.sourceUrl || undefined,
        displayHomepage: parsed.data.displayHomepage,
        displayCateringPages: parsed.data.displayCateringPages,
        active: parsed.data.active,
      },
    });
    revalidatePublicPages();
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not save this award." };
  }
}

const createSchema = z.object({
  organization: z.string().min(1, "Organization is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

export async function createAward(input: z.infer<typeof createSchema>) {
  const permission = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const count = await db.awardRecognition.count();
    await db.awardRecognition.create({
      data: {
        organization: parsed.data.organization,
        title: parsed.data.title,
        description: parsed.data.description || undefined,
        sortOrder: count,
        active: true,
        displayHomepage: true,
        displayCateringPages: true,
      },
    });
    revalidatePublicPages();
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not create this award." };
  }
}

const deleteSchema = z.object({ id: z.string().min(1) });

export async function deleteAward(input: z.infer<typeof deleteSchema>) {
  const permission = await requirePermission(PERMISSIONS.CONTENT_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid request." };

  try {
    await db.awardRecognition.delete({ where: { id: parsed.data.id } });
    revalidatePublicPages();
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not delete this award." };
  }
}
