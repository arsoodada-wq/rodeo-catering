"use client";

import { useEffect, useState } from "react";
import { Check, ImageOff, X } from "lucide-react";
import { cn } from "@/lib/cn";

type MediaItem = { id: string; filename: string; url: string; altText: string | null };

/**
 * Fetches the library itself (rather than the parent passing it down) so
 * any admin screen can drop this in without also wiring a server-side
 * media query — the list is small enough (this app's actual media scale)
 * that a client-side fetch on open is simpler than threading it through
 * every parent page's own data-fetching.
 */
export function MediaPicker({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [selected, setSelected] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    fetch(`/api/media/${selectedId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((item) => {
        if (!cancelled) setSelected(item);
      })
      .catch(() => {
        if (!cancelled) setSelected(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  function openPicker() {
    setOpen(true);
    if (!items) {
      fetch("/api/media")
        .then((res) => res.json())
        .then((data) => setItems(data.media ?? []))
        .catch(() => setItems([]));
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        {selected ? (
          // eslint-disable-next-line @next/next/no-img-element -- data: URI thumbnail
          <img src={selected.url} alt="" className="h-16 w-16 rounded-lg border border-ink-900/10 object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-ink-900/20 text-ink-300">
            <ImageOff className="h-5 w-5" />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={openPicker}
            className="rounded-full border border-ink-900/15 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:border-ink-900/40"
          >
            {selected ? "Change image" : "Choose image"}
          </button>
          {selected && (
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setSelected(null);
              }}
              className="flex items-center gap-1 text-xs text-ink-400 hover:text-rodeo-600"
            >
              <X className="h-3 w-3" /> Remove
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-3 rounded-2xl border border-ink-900/8 bg-cream-100/50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Media library
            </p>
            <button type="button" onClick={() => setOpen(false)} className="text-ink-400 hover:text-ink-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          {items === null ? (
            <p className="mt-3 text-sm text-ink-400">Loading…</p>
          ) : items.length === 0 ? (
            <p className="mt-3 text-sm text-ink-400">
              No images uploaded yet — add one at /admin/media first.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {items.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    onSelect(item.id);
                    setSelected(item);
                    setOpen(false);
                  }}
                  className={cn(
                    "relative overflow-hidden rounded-lg border-2",
                    item.id === selectedId ? "border-rodeo-500" : "border-transparent hover:border-ink-900/20"
                  )}
                  title={item.filename}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- data: URI thumbnail */}
                  <img src={item.url} alt="" className="h-16 w-full object-cover" />
                  {item.id === selectedId && (
                    <span className="absolute right-1 top-1 rounded-full bg-rodeo-500 p-0.5 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
