"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { updateAward, deleteAward } from "@/app/actions/update-award";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  organization: string;
  title: string;
  description: string | null;
  sourceUrl: string | null;
  displayHomepage: boolean;
  displayCateringPages: boolean;
  active: boolean;
};

export function AwardRow({
  id,
  organization,
  title,
  description,
  sourceUrl,
  displayHomepage,
  displayCateringPages,
  active,
}: Props) {
  const [org, setOrg] = useState(organization);
  const [titleValue, setTitleValue] = useState(title);
  const [desc, setDesc] = useState(description ?? "");
  const [url, setUrl] = useState(sourceUrl ?? "");
  const [onHomepage, setOnHomepage] = useState(displayHomepage);
  const [onCatering, setOnCatering] = useState(displayCateringPages);
  const [activeValue, setActiveValue] = useState(active);
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
      const res = await updateAward({
        id,
        organization: org,
        title: titleValue,
        description: desc,
        sourceUrl: url,
        displayHomepage: onHomepage,
        displayCateringPages: onCatering,
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
    startTransition(async () => {
      const res = await deleteAward({ id });
      if (res.ok) {
        setDeleted(true);
        showToast("Award deleted.", "success");
      } else {
        setError(res.error);
        showToast(res.error, "error");
      }
      setConfirmOpen(false);
    });
  }

  if (deleted) return null;

  return (
    <div className="rounded-2xl border border-ink-900/8 bg-white p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Title
          </label>
          <input
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            className="input mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Organization
          </label>
          <input value={org} onChange={(e) => setOrg(e.target.value)} className="input mt-1" />
        </div>
      </div>

      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Description (optional)
      </label>
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        rows={2}
        className="input mt-1 resize-none"
      />

      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Source URL (optional)
      </label>
      <input value={url} onChange={(e) => setUrl(e.target.value)} className="input mt-1" />

      <div className="mt-3 flex flex-wrap items-center gap-4">
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
            checked={onHomepage}
            onChange={(e) => setOnHomepage(e.target.checked)}
          />
          Show on homepage
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={onCatering}
            onChange={(e) => setOnCatering(e.target.checked)}
          />
          Show on catering pages
        </label>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          onClick={() => setConfirmOpen(true)}
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
      {error && <p className="mt-2 text-xs text-rodeo-600">{error}</p>}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this award?"
        description="This removes it from wherever it's currently displayed. This can't be undone."
        confirmLabel="Delete"
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={remove}
      />
    </div>
  );
}
