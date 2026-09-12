"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { createOutreachContact } from "@/app/actions/outreach";

export function NewOutreachContactForm() {
  const [open, setOpen] = useState(false);
  const [organization, setOrganization] = useState("");
  const [category, setCategory] = useState("");
  const [website, setWebsite] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createOutreachContact({
        organization,
        category,
        website,
        status: "PROSPECT",
      });
      if (res.ok) {
        setOrganization("");
        setCategory("");
        setWebsite("");
        setOpen(false);
        router.push(`/admin/outreach/${res.id}`);
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
        <Plus className="h-4 w-4" /> Add a contact
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Organization
          </label>
          <input
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="e.g. Worth Chamber of Commerce"
            className="input mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Category (optional)
          </label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="venue, school, church, chamber, blogger..."
            className="input mt-1"
          />
        </div>
      </div>
      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Website (optional)
      </label>
      <input value={website} onChange={(e) => setWebsite(e.target.value)} className="input mt-1" />
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={submit}
          disabled={pending || !organization.trim()}
          className="flex items-center gap-1.5 rounded-full bg-rodeo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rodeo-600 disabled:opacity-50"
        >
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Add Contact
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
