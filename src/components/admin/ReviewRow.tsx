"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { updateReview, deleteReview } from "@/app/actions/update-review";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  customerName: string;
  rating: number;
  reviewText: string;
  source: string | null;
  active: boolean;
};

export function ReviewRow({ id, customerName, rating, reviewText, source, active }: Props) {
  const [name, setName] = useState(customerName);
  const [ratingValue, setRatingValue] = useState(rating);
  const [text, setText] = useState(reviewText);
  const [sourceValue, setSourceValue] = useState(source ?? "");
  const [activeValue, setActiveValue] = useState(active);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateReview({
        id,
        customerName: name,
        rating: ratingValue,
        reviewText: text,
        source: sourceValue,
        active: activeValue,
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
    if (!confirm("Delete this review? This can't be undone.")) return;
    startTransition(async () => {
      const res = await deleteReview({ id });
      if (res.ok) setDeleted(true);
      else setError(res.error);
    });
  }

  if (deleted) return null;

  return (
    <div className="rounded-2xl border border-ink-900/8 bg-white p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Customer name
          </label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Rating
          </label>
          <select
            value={ratingValue}
            onChange={(e) => setRatingValue(Number(e.target.value))}
            className="input mt-1"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} star{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Source
          </label>
          <input
            value={sourceValue}
            onChange={(e) => setSourceValue(e.target.value)}
            placeholder="e.g. Google"
            className="input mt-1"
          />
        </div>
      </div>

      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Review text
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="input mt-1 resize-none"
      />

      <div className="mt-3 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={activeValue}
            onChange={(e) => setActiveValue(e.target.checked)}
          />
          Visible on site
        </label>

        <div className="flex items-center gap-2">
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
      </div>
      {error && <p className="mt-2 text-xs text-rodeo-600">{error}</p>}
    </div>
  );
}
