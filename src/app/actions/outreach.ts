"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { PERMISSIONS, requirePermission } from "@/lib/permissions";

const statusSchema = z.enum([
  "PROSPECT",
  "CONTACTED",
  "RESPONDED",
  "INTERESTED",
  "LINK_ACQUIRED",
  "NOT_INTERESTED",
  "FOLLOW_UP",
]);

const contactFields = {
  organization: z.string().min(1, "Organization is required"),
  website: z.string().optional(),
  category: z.string().optional(),
  contactName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  status: statusSchema,
  backlinkUrl: z.string().optional(),
  notes: z.string().optional(),
};

const createContactSchema = z.object(contactFields);

export async function createOutreachContact(input: z.infer<typeof createContactSchema>) {
  const permission = await requirePermission(PERMISSIONS.MARKETING_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = createContactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const created = await db.outreachContact.create({
      data: {
        organization: parsed.data.organization,
        website: parsed.data.website || undefined,
        category: parsed.data.category || undefined,
        contactName: parsed.data.contactName || undefined,
        email: parsed.data.email || undefined,
        phone: parsed.data.phone || undefined,
        status: parsed.data.status,
        backlinkUrl: parsed.data.backlinkUrl || undefined,
        notes: parsed.data.notes || undefined,
      },
    });
    revalidatePath("/admin/outreach");
    return { ok: true as const, id: created.id };
  } catch {
    return { ok: false as const, error: "Could not create this contact." };
  }
}

const updateContactSchema = z.object({ id: z.string().min(1), ...contactFields });

export async function updateOutreachContact(input: z.infer<typeof updateContactSchema>) {
  const permission = await requirePermission(PERMISSIONS.MARKETING_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = updateContactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await db.outreachContact.update({
      where: { id: parsed.data.id },
      data: {
        organization: parsed.data.organization,
        website: parsed.data.website || undefined,
        category: parsed.data.category || undefined,
        contactName: parsed.data.contactName || undefined,
        email: parsed.data.email || undefined,
        phone: parsed.data.phone || undefined,
        status: parsed.data.status,
        backlinkUrl: parsed.data.backlinkUrl || undefined,
        notes: parsed.data.notes || undefined,
      },
    });
    revalidatePath("/admin/outreach");
    revalidatePath(`/admin/outreach/${parsed.data.id}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not save this contact." };
  }
}

const deleteContactSchema = z.object({ id: z.string().min(1) });

export async function deleteOutreachContact(input: z.infer<typeof deleteContactSchema>) {
  const permission = await requirePermission(PERMISSIONS.MARKETING_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = deleteContactSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid request." };

  try {
    await db.outreachContact.delete({ where: { id: parsed.data.id } });
    revalidatePath("/admin/outreach");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not delete this contact." };
  }
}

const addActivitySchema = z.object({
  outreachContactId: z.string().min(1),
  type: z.string().min(1, "Activity type is required"),
  notes: z.string().optional(),
  response: z.string().optional(),
  followUpDate: z.string().optional(), // yyyy-mm-dd or ""
});

export async function addOutreachActivity(input: z.infer<typeof addActivitySchema>) {
  const permission = await requirePermission(PERMISSIONS.MARKETING_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = addActivitySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const followUpDate = parsed.data.followUpDate
    ? new Date(`${parsed.data.followUpDate}T00:00:00.000Z`)
    : null;

  try {
    await db.outreachActivity.create({
      data: {
        outreachContactId: parsed.data.outreachContactId,
        type: parsed.data.type,
        notes: parsed.data.notes || undefined,
        response: parsed.data.response || undefined,
        followUpDate: followUpDate && !Number.isNaN(followUpDate.getTime()) ? followUpDate : undefined,
      },
    });
    revalidatePath(`/admin/outreach/${parsed.data.outreachContactId}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not log this activity." };
  }
}

const deleteActivitySchema = z.object({ id: z.string().min(1), outreachContactId: z.string().min(1) });

export async function deleteOutreachActivity(input: z.infer<typeof deleteActivitySchema>) {
  const permission = await requirePermission(PERMISSIONS.MARKETING_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = deleteActivitySchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid request." };

  try {
    await db.outreachActivity.delete({ where: { id: parsed.data.id } });
    revalidatePath(`/admin/outreach/${parsed.data.outreachContactId}`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not remove this activity." };
  }
}
