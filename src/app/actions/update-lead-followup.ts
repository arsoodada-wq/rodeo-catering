"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { PERMISSIONS, requirePermission } from "@/lib/permissions";

const schema = z.object({
  leadId: z.string().min(1),
  followUpDate: z.string().optional(), // yyyy-mm-dd, or "" to clear
});

export async function updateLeadFollowUp(input: z.infer<typeof schema>) {
  const permission = await requirePermission(PERMISSIONS.LEADS_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input." };

  let followUpDate: Date | null = null;
  if (parsed.data.followUpDate) {
    const date = new Date(`${parsed.data.followUpDate}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return { ok: false as const, error: "Invalid date." };
    followUpDate = date;
  }

  try {
    await db.lead.update({ where: { id: parsed.data.leadId }, data: { followUpDate } });
    revalidatePath(`/admin/leads/${parsed.data.leadId}`);
    revalidatePath("/admin/leads");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not save the follow-up date." };
  }
}
