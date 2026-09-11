"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { createUser } from "@/app/actions/update-user";

const ROLES = ["MANAGER", "STAFF", "MARKETING", "SUPER_ADMIN"] as const;

export function NewUserForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("STAFF");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createUser({ name, email, password, role });
      if (res.ok) {
        setName("");
        setEmail("");
        setPassword("");
        setRole("STAFF");
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-dashed border-ink-900/20 px-4 py-2.5 text-sm font-semibold text-ink-600 hover:border-rodeo-300 hover:text-rodeo-600"
      >
        <Plus className="h-4 w-4" /> Add a new admin account
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-5">
      <p className="mb-3 text-xs font-medium text-rodeo-700">
        They&apos;ll sign in at /admin/login with this email and password — share the password
        with them directly, it isn&apos;t emailed.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Temporary password
          </label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="input mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
            className="input mt-1"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={submit}
          disabled={pending || !name.trim() || !email.trim() || password.length < 8}
          className="flex items-center gap-1.5 rounded-full bg-rodeo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rodeo-600 disabled:opacity-50"
        >
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Create Account
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-full px-4 py-2 text-xs font-semibold text-ink-400 hover:text-ink-600"
        >
          Cancel
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-rodeo-600">{error}</p>}
    </div>
  );
}
