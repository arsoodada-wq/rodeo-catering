"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { updateSeoOverride } from "@/app/actions/update-seo-override";
import { useToast } from "@/components/ui/ToastProvider";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

type Props = {
  path: string;
  label: string;
  defaultTitle: string;
  defaultDescription: string;
  overrideTitle?: string;
  overrideDescription?: string;
};

export function SeoOverrideRow({
  path,
  label,
  defaultTitle,
  defaultDescription,
  overrideTitle,
  overrideDescription,
}: Props) {
  const [title, setTitle] = useState(overrideTitle ?? "");
  const [description, setDescription] = useState(overrideDescription ?? "");
  const [hasOverride, setHasOverride] = useState(Boolean(overrideTitle || overrideDescription));
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateSeoOverride({ path, title, description });
      if (res.ok) {
        setHasOverride(Boolean(title.trim() || description.trim()));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(res.error);
        showToast(res.error, "error");
      }
    });
  }

  function resetToDefault() {
    setTitle("");
    setDescription("");
    startTransition(async () => {
      const res = await updateSeoOverride({ path, title: "", description: "" });
      if (res.ok) {
        setHasOverride(false);
        showToast("Reverted to the default.", "success");
      } else {
        setError(res.error);
        showToast(res.error, "error");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-ink-900/8 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-ink-900">{label}</p>
          <code className="rounded bg-cream-100 px-1.5 py-0.5 text-xs text-ink-500">{path}</code>
        </div>
        <Badge tone={hasOverride ? "warning" : "neutral"}>
          {hasOverride ? "Overridden" : "Using default"}
        </Badge>
      </div>

      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Title override
      </label>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={defaultTitle}
        className="input mt-1"
      />

      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Description override
      </label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={defaultDescription}
        rows={2}
        className="input mt-1 resize-none"
      />

      <div className="mt-3 flex items-center justify-end gap-2">
        {hasOverride && (
          <button
            onClick={resetToDefault}
            disabled={pending}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-400 hover:text-rodeo-600"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset to default
          </button>
        )}
        <button
          onClick={save}
          disabled={pending}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
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
      {error && <p className="mt-2 text-right text-xs text-rodeo-600">{error}</p>}
    </div>
  );
}
