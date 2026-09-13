"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { createPage } from "@/app/actions/pages";

export function NewPageForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createPage({ title });
      if (res.ok) {
        setTitle("");
        setOpen(false);
        router.push(`/admin/pages/${res.id}`);
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
        <Plus className="h-4 w-4" /> Create a new page
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-5">
      <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Title</label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Spring Catering Promotion"
        className="input mt-1"
      />
      <p className="mt-2 text-xs text-ink-500">
        Starts as a draft — the URL is generated from the title, and you can adjust everything
        (including the URL) on the next screen before publishing.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={submit}
          disabled={pending || !title.trim()}
          className="flex items-center gap-1.5 rounded-full bg-rodeo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rodeo-600 disabled:opacity-50"
        >
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Create Draft
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
