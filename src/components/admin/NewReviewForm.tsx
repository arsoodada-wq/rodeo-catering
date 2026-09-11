"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { createReview } from "@/app/actions/update-review";

export function NewReviewForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createReview({ customerName: name, rating, reviewText: text, source });
      if (res.ok) {
        setName("");
        setText("");
        setSource("");
        setRating(5);
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
        <Plus className="h-4 w-4" /> Add a real customer review
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-5">
      <p className="mb-3 text-xs font-medium text-rodeo-700">
        Only add real reviews from actual customers — never a made-up example.
      </p>
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
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
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
            value={source}
            onChange={(e) => setSource(e.target.value)}
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
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={submit}
          disabled={pending || !name.trim() || !text.trim()}
          className="flex items-center gap-1.5 rounded-full bg-rodeo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rodeo-600 disabled:opacity-50"
        >
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Add Review
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
