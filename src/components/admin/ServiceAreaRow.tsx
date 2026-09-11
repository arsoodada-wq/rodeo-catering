"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { updateServiceArea, deleteServiceArea } from "@/app/actions/update-service-area";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  city: string;
  state: string;
  notes: string | null;
  active: boolean;
  deliveryAvailable: boolean;
};

export function ServiceAreaRow({ id, city, state, notes, active, deliveryAvailable }: Props) {
  const [notesValue, setNotesValue] = useState(notes ?? "");
  const [activeValue, setActiveValue] = useState(active);
  const [deliveryValue, setDeliveryValue] = useState(deliveryAvailable);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateServiceArea({
        id,
        notes: notesValue,
        active: activeValue,
        deliveryAvailable: deliveryValue,
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(res.error);
      }
    });
  }

  function remove() {
    if (!confirm(`Delete ${city}, ${state} from the service area list?`)) return;
    startTransition(async () => {
      const res = await deleteServiceArea({ id });
      if (res.ok) setDeleted(true);
      else setError(res.error);
    });
  }

  if (deleted) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink-900/8 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <p className="font-bold text-ink-900">
          {city}, {state}
        </p>
        <input
          value={notesValue}
          onChange={(e) => setNotesValue(e.target.value)}
          placeholder="Internal notes (optional)"
          className="input mt-2 text-xs"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={activeValue}
            onChange={(e) => setActiveValue(e.target.checked)}
          />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={deliveryValue}
            onChange={(e) => setDeliveryValue(e.target.checked)}
          />
          Delivery available
        </label>

        <button
          onClick={remove}
          disabled={pending}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-400 hover:text-rodeo-600"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
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
      {error && <p className="text-xs text-rodeo-600">{error}</p>}
    </div>
  );
}
