import { db } from "@/lib/db";

const SETTING_KEY = "notifications";

export type NotificationSettings = { email?: string; phone?: string };

/**
 * Admin-editable at /admin/notifications, falling back to the env vars
 * (ADMIN_NOTIFICATION_EMAIL) so a fresh deploy with no DB row yet still
 * notifies someone rather than silently notifying no one.
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: SETTING_KEY } });
    const value = (setting?.value as NotificationSettings | undefined) ?? {};
    return {
      email: value.email || process.env.ADMIN_NOTIFICATION_EMAIL || undefined,
      phone: value.phone || undefined,
    };
  } catch {
    return { email: process.env.ADMIN_NOTIFICATION_EMAIL || undefined };
  }
}

export async function saveNotificationSettings(value: NotificationSettings): Promise<void> {
  await db.siteSetting.upsert({
    where: { key: SETTING_KEY },
    create: {
      key: SETTING_KEY,
      value,
      description: "Where new-lead alerts are sent (email now; phone reserved for future SMS).",
    },
    update: { value },
  });
}
