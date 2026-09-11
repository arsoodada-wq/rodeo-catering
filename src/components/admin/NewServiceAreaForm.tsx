"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { createServiceArea } from "@/app/actions/update-service-area";

export function NewServiceAreaForm() {
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("");
  const [state, setState] = useState("IL");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createServiceArea({ city, state });
      if (res.ok) {
        setCity("");
        setState("IL");
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
        <Plus className="h-4 w-4" /> Add a city
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-5">
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            City
          </label>
          <input value={city} onChange={(e) => setCity(e.target.value)} className="input mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            State
          </label>
          <input
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="input mt-1"
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-400">
        New areas start inactive — confirm the business actually serves it before activating.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={submit}
          disabled={pending || !city.trim() || !state.trim()}
          className="flex items-center gap-1.5 rounded-full bg-rodeo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rodeo-600 disabled:opacity-50"
        >
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Add City
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
