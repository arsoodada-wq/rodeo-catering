"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { PERMISSIONS, requirePermission } from "@/lib/permissions";
import { slugify } from "@/lib/slugify";

function revalidatePublicPages() {
  revalidatePath("/");
  revalidatePath("/catering");
  revalidatePath("/admin/service-areas");
}

const updateSchema = z.object({
  id: z.string().min(1),
  notes: z.string().optional(),
  active: z.boolean(),
  deliveryAvailable: z.boolean(),
});

export async function updateServiceArea(input: z.infer<typeof updateSchema>) {
  const permission = await requirePermission(PERMISSIONS.SERVICE_AREAS_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await db.serviceArea.update({
      where: { id: parsed.data.id },
      data: {
        notes: parsed.data.notes || undefined,
        active: parsed.data.active,
        deliveryAvailable: parsed.data.deliveryAvailable,
      },
    });
    revalidatePublicPages();
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not save this service area." };
  }
}

const createSchema = z.object({
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
});

export async function createServiceArea(input: z.infer<typeof createSchema>) {
  const permission = await requirePermission(PERMISSIONS.SERVICE_AREAS_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const slug = slugify(parsed.data.city, parsed.data.state);
    const existing = await db.serviceArea.findUnique({ where: { slug } });
    if (existing) {
      return { ok: false as const, error: "This city/state is already in the list." };
    }
    await db.serviceArea.create({
      data: {
        slug,
        city: parsed.data.city,
        state: parsed.data.state,
        active: false,
        deliveryAvailable: false,
        notes: "REQUIRES BUSINESS CONFIRMATION before enabling.",
      },
    });
    revalidatePublicPages();
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not create this service area." };
  }
}

const deleteSchema = z.object({ id: z.string().min(1) });

export async function deleteServiceArea(input: z.infer<typeof deleteSchema>) {
  const permission = await requirePermission(PERMISSIONS.SERVICE_AREAS_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid request." };

  try {
    await db.serviceArea.delete({ where: { id: parsed.data.id } });
    revalidatePublicPages();
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not delete this service area." };
  }
}
