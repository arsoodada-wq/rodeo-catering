import { AlertTriangle } from "lucide-react";
import { currentUserRole } from "@/lib/permissions";
import { getNotificationSettings } from "@/lib/notification-settings";
import { NotificationSettingsForm } from "@/components/admin/NotificationSettingsForm";

export default async function AdminNotificationsPage() {
  const role = await currentUserRole();
  if (role !== "SUPER_ADMIN") {
    return (
      <div className="rounded-2xl border border-ink-900/10 bg-cream-100 p-6">
        <h1 className="text-lg font-bold text-ink-900">Access restricted</h1>
        <p className="mt-2 text-sm text-ink-500">
          Only a Super Admin can change where lead alerts are sent.
        </p>
      </div>
    );
  }

  let settings;
  try {
    settings = await getNotificationSettings();
  } catch {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage
          notification settings here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Notifications</h1>
      <p className="mt-1 text-sm text-ink-400">
        Choose who gets alerted when a new catering lead comes in.
      </p>

      <div className="mt-6">
        <NotificationSettingsForm
          initialEmail={settings.email ?? ""}
          initialPhone={settings.phone ?? ""}
        />
      </div>
    </div>
  );
}
