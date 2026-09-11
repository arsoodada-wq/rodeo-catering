"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { PERMISSIONS, requirePermission } from "@/lib/permissions";

const VALID_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUOTE_SENT",
  "FOLLOW_UP",
  "CONFIRMED",
  "COMPLETED",
  "LOST",
] as const;

export async function updateLeadStatus(leadId: string, status: string) {
  const permission = await requirePermission(PERMISSIONS.LEADS_MANAGE);
  if (!permission.ok) {
    return { ok: false as const, error: permission.error };
  }
  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return { ok: false as const, error: "Invalid status." };
  }

  try {
    await db.lead.update({
      where: { id: leadId },
      data: { status: status as (typeof VALID_STATUSES)[number] },
    });
    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not update lead." };
  }
}
