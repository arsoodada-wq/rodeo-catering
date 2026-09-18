"use client";

import { useState, useTransition } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { updateNotificationSettings } from "@/app/actions/update-notification-settings";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/cn";

export function NotificationSettingsForm({
  initialEmail,
  initialPhone,
}: {
  initialEmail: string;
  initialPhone: string;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  function submit() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateNotificationSettings({ email, phone });
      if (res.ok) {
        setSaved(true);
        showToast("Notification settings saved.", "success");
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(res.error);
        showToast(res.error, "error");
      }
    });
  }

  return (
    <div className="max-w-md rounded-2xl border border-ink-900/8 bg-white p-6">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-rodeo-600" />
        <h2 className="font-bold text-ink-900">New Lead Alerts</h2>
      </div>
      <p className="mt-1 text-sm text-ink-400">
        Every catering lead (wizard or AI concierge) sends an alert here the moment it comes in.
      </p>

      <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Notification email
      </label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="input mt-1"
      />

      <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Cell phone (for text alerts)
      </label>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="(708) 555-0100"
        className="input mt-1"
      />
      <p className="mt-1.5 text-xs text-ink-400">
        Saved for when text alerts go live — no texts are sent yet, so this number is safe to add
        now.
      </p>

      <button
        onClick={submit}
        disabled={pending}
        className={cn(
          "mt-5 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50",
          saved ? "bg-green-100 text-green-700" : "bg-rodeo-500 text-white hover:bg-rodeo-600",
          pending && "opacity-60"
        )}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : saved ? (
          <Check className="h-3.5 w-3.5" />
        ) : null}
        {saved ? "Saved" : "Save"}
      </button>
      {error && <p className="mt-2 text-xs text-rodeo-600">{error}</p>}
    </div>
  );
}
