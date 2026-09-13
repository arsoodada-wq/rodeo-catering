"use client";

import { useState, useTransition } from "react";
import { Check, KeyRound, Loader2 } from "lucide-react";
import { changeOwnPassword } from "@/app/actions/change-own-password";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/cn";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit =
    currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

  function submit() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await changeOwnPassword({ currentPassword, newPassword });
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSaved(true);
        showToast("Password updated.", "success");
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
        <KeyRound className="h-4 w-4 text-rodeo-600" />
        <h2 className="font-bold text-ink-900">Change Password</h2>
      </div>
      <p className="mt-1 text-sm text-ink-400">
        You&apos;ll need your current password to set a new one.
      </p>

      <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Current password
      </label>
      <input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        autoComplete="current-password"
        className="input mt-1"
      />

      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        New password
      </label>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        autoComplete="new-password"
        placeholder="At least 8 characters"
        className="input mt-1"
      />

      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Confirm new password
      </label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
        className="input mt-1"
      />
      {mismatch && <p className="mt-1 text-xs text-rodeo-600">Passwords don&apos;t match.</p>}

      <button
        onClick={submit}
        disabled={pending || !canSubmit}
        className={cn(
          "mt-4 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50",
          saved ? "bg-green-100 text-green-700" : "bg-rodeo-500 text-white hover:bg-rodeo-600",
          pending && "opacity-60"
        )}
      >
        {pending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : saved ? (
          <Check className="h-3.5 w-3.5" />
        ) : null}
        {saved ? "Updated" : "Update Password"}
      </button>
      {error && <p className="mt-2 text-xs text-rodeo-600">{error}</p>}
    </div>
  );
}
