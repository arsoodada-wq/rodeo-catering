"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { currentUserRole } from "@/lib/permissions";
import { saveNotificationSettings } from "@/lib/notification-settings";

// Same phone shape the lead-form wizard already accepts (see
// submit-catering-lead.ts) — kept loose since this is a US-based single
// location and callers copy-paste numbers in all sorts of formats.
const schema = z.object({
  email: z.string().trim().email("Enter a valid email address.").optional().or(z.literal("")),
  phone: z.string().trim().min(7, "Enter a valid phone number.").optional().or(z.literal("")),
});

/**
 * Notification routing is business-critical (it decides who finds out about
 * a new lead) and, like /admin/users and /admin/permissions, is restricted
 * to Super Admin rather than the delegable permission system.
 */
export async function updateNotificationSettings(input: z.infer<typeof schema>) {
  const role = await currentUserRole();
  if (role !== "SUPER_ADMIN") {
    return { ok: false as const, error: "Only a Super Admin can change notification settings." };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await saveNotificationSettings({
      email: parsed.data.email || undefined,
      phone: parsed.data.phone || undefined,
    });
    revalidatePath("/admin/notifications");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not save notification settings." };
  }
}
