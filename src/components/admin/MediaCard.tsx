"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { updateMedia, deleteMedia } from "@/app/actions/media";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  filename: string;
  url: string;
  altText: string | null;
  caption: string | null;
  category: string | null;
  sizeBytes: number | null;
};

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaCard({ id, filename, url, altText, caption, category, sizeBytes }: Props) {
  const [altTextValue, setAltTextValue] = useState(altText ?? "");
  const [captionValue, setCaptionValue] = useState(caption ?? "");
  const [categoryValue, setCategoryValue] = useState(category ?? "");
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleted, setDeleted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useToast();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateMedia({ id, altText: altTextValue, caption: captionValue, category: categoryValue });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(res.error);
        showToast(res.error, "error");
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await deleteMedia({ id });
      if (res.ok) {
        setDeleted(true);
        showToast("Image deleted.", "success");
      } else {
        showToast(res.error, "error");
      }
      setConfirmOpen(false);
    });
  }

  if (deleted) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-900/8 bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element -- data: URI, not an optimizable remote/local asset next/image expects */}
      <img src={url} alt={altText ?? filename} className="h-40 w-full bg-cream-100 object-cover" />
      <div className="p-4">
        <p className="truncate text-sm font-semibold text-ink-900">{filename}</p>
        <p className="text-xs text-ink-400">{formatSize(sizeBytes)}</p>

        <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
          Alt text
        </label>
        <input
          value={altTextValue}
          onChange={(e) => setAltTextValue(e.target.value)}
          className="input mt-1 text-sm"
        />

        <label className="mt-2 block text-xs font-semibold uppercase tracking-wide text-ink-400">
          Category
        </label>
        <input
          value={categoryValue}
          onChange={(e) => setCategoryValue(e.target.value)}
          className="input mt-1 text-sm"
        />

        <label className="mt-2 block text-xs font-semibold uppercase tracking-wide text-ink-400">
          Caption
        </label>
        <input
          value={captionValue}
          onChange={(e) => setCaptionValue(e.target.value)}
          className="input mt-1 text-sm"
        />

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={pending}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-ink-400 hover:text-rodeo-600"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
          <button
            onClick={save}
            disabled={pending}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
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
        {error && <p className="mt-2 text-xs text-rodeo-600">{error}</p>}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this image?"
        description="If it's currently set as a featured image anywhere, that will be cleared. This can't be undone."
        confirmLabel="Delete"
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={remove}
      />
    </div>
  );
}
