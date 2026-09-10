"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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
  const session = await auth();
  if (!session?.user) {
    return { ok: false as const, error: "Not authenticated." };
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
