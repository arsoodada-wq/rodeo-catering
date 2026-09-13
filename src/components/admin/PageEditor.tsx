"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { updatePage, deletePage } from "@/app/actions/pages";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { PageBlockEditor } from "@/components/admin/PageBlockEditor";
import type { PageBlock } from "@/lib/page-blocks";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  title: string;
  slug: string;
  h1: string | null;
  content: PageBlock[];
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  status: string;
};

export function PageEditor(page: Props) {
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [h1, setH1] = useState(page.h1 ?? "");
  const [content, setContent] = useState<PageBlock[]>(page.content);
  const [seoTitle, setSeoTitle] = useState(page.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(page.seoDescription ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(page.canonicalUrl ?? "");
  const [noindex, setNoindex] = useState(page.noindex);
  const [status, setStatus] = useState(page.status);

  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updatePage({
        id: page.id,
        title,
        slug,
        h1,
        content,
        seoTitle,
        seoDescription,
        canonicalUrl,
        noindex,
        status: status as "DRAFT" | "PUBLISHED",
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      } else {
        setError(res.error);
        showToast(res.error, "error");
      }
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await deletePage({ id: page.id });
      if (res.ok) {
        showToast("Page deleted.", "success");
        router.push("/admin/pages");
      } else {
        setError(res.error);
        showToast(res.error, "error");
        setConfirmOpen(false);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-ink-900/8 bg-white p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            URL slug
          </label>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="shrink-0 text-xs text-ink-400">/</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="input" />
            {page.status === "PUBLISHED" && (
              <a
                href={`/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-ink-300 hover:text-rodeo-600"
                aria-label="View live page"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        H1 (optional — falls back to the title)
      </label>
      <input value={h1} onChange={(e) => setH1(e.target.value)} className="input mt-1" />

      <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Content blocks
      </label>
      <div className="mt-1">
        <PageBlockEditor blocks={content} onChange={setContent} />
      </div>

      <div className="mt-5 rounded-xl border border-ink-900/8 bg-cream-100/50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-500">
          Search appearance (optional overrides)
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              SEO title
            </label>
            <input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={title}
              className="input mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Canonical URL (only if this content is republished elsewhere)
            </label>
            <input
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
              className="input mt-1"
            />
          </div>
        </div>
        <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
          SEO description
        </label>
        <textarea
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
          rows={2}
          className="input mt-1 resize-none"
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-ink-600">
          <input type="checkbox" checked={noindex} onChange={(e) => setNoindex(e.target.checked)} />
          Hide from search engines (noindex)
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={pending}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-400 hover:text-rodeo-600"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
        <div className="flex items-center gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
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
      </div>
      {error && <p className="mt-2 text-right text-xs text-rodeo-600">{error}</p>}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this page?"
        description="This removes it permanently, including from the public site if it's published. This can't be undone."
        confirmLabel="Delete"
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={remove}
      />
    </div>
  );
}
