"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, KeyRound } from "lucide-react";
import { updateUser, resetUserPassword } from "@/app/actions/update-user";
import { cn } from "@/lib/cn";

const ROLES = ["SUPER_ADMIN", "MANAGER", "STAFF", "MARKETING"] as const;

type Props = {
  id: string;
  name: string;
  email: string;
  role: (typeof ROLES)[number];
  active: boolean;
  isCurrentUser: boolean;
};

export function UserRow({ id, name, email, role, active, isCurrentUser }: Props) {
  const [nameValue, setNameValue] = useState(name);
  const [roleValue, setRoleValue] = useState(role);
  const [activeValue, setActiveValue] = useState(active);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetOpen, setResetOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetPending, startResetTransition] = useTransition();
  const [resetDone, setResetDone] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateUser({ id, name: nameValue, role: roleValue, active: activeValue });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(res.error);
      }
    });
  }

  function submitReset() {
    setResetError(null);
    setResetDone(false);
    startResetTransition(async () => {
      const res = await resetUserPassword({ id, password: newPassword });
      if (res.ok) {
        setResetDone(true);
        setNewPassword("");
        setTimeout(() => {
          setResetDone(false);
          setResetOpen(false);
        }, 1500);
      } else {
        setResetError(res.error);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-ink-900/8 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <input
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            className="input font-bold text-ink-900"
          />
          <p className="mt-1 text-xs text-ink-400">
            {email} {isCurrentUser && "· this is you"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <select
            value={roleValue}
            onChange={(e) => setRoleValue(e.target.value as (typeof ROLES)[number])}
            disabled={isCurrentUser}
            className="input text-sm disabled:opacity-50"
            title={isCurrentUser ? "You can't change your own role" : undefined}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace("_", " ")}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-ink-600">
            <input
              type="checkbox"
              checked={activeValue}
              disabled={isCurrentUser}
              onChange={(e) => setActiveValue(e.target.checked)}
            />
            Active
          </label>

          <button
            onClick={() => setResetOpen((v) => !v)}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-400 hover:text-rodeo-600"
          >
            <KeyRound className="h-3.5 w-3.5" /> Reset password
          </button>

          <button
            onClick={save}
            disabled={pending}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
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
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-rodeo-600">{error}</p>}

      {resetOpen && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-900/8 pt-4">
          <input
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (at least 8 characters)"
            className="input flex-1 text-sm"
          />
          <button
            onClick={submitReset}
            disabled={resetPending || newPassword.length < 8}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              resetDone ? "bg-green-100 text-green-700" : "bg-ink-900 text-white hover:bg-ink-700",
              resetPending && "opacity-60"
            )}
          >
            {resetPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : resetDone ? (
              <Check className="h-3.5 w-3.5" />
            ) : null}
            {resetDone ? "Password reset" : "Set new password"}
          </button>
          {resetError && <p className="w-full text-xs text-rodeo-600">{resetError}</p>}
        </div>
      )}
    </div>
  );
}
