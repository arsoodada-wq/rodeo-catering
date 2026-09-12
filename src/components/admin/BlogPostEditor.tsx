"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { updateBlogPost, deleteBlogPost } from "@/app/actions/blog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  tags: string[];
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  status: string;
  publishedAt: Date | string | null;
};

export function BlogPostEditor(post: Props) {
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [category, setCategory] = useState(post.category ?? "");
  const [tags, setTags] = useState(post.tags.join(", "));
  const [content, setContent] = useState(post.content);
  const [seoTitle, setSeoTitle] = useState(post.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(post.seoDescription ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(post.canonicalUrl ?? "");
  const [status, setStatus] = useState(post.status);

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
      const res = await updateBlogPost({
        id: post.id,
        title,
        slug,
        category,
        tags,
        content,
        seoTitle,
        seoDescription,
        canonicalUrl,
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
      const res = await deleteBlogPost({ id: post.id });
      if (res.ok) {
        showToast("Post deleted.", "success");
        router.push("/admin/blog");
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
            <span className="shrink-0 text-xs text-ink-400">/blog/</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="input" />
            {post.status === "PUBLISHED" && (
              <a
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-ink-300 hover:text-rodeo-600"
                aria-label="View live post"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Category (optional)
          </label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Tags (comma-separated, optional)
          </label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className="input mt-1" />
        </div>
      </div>

      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Content
      </label>
      <p className="mt-0.5 text-xs text-ink-400">
        Plain text — separate paragraphs with a blank line. No HTML needed or rendered.
      </p>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={14}
        className="input mt-1 resize-y font-mono text-sm"
      />

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
          placeholder="Falls back to an excerpt of the content if left blank."
          className="input mt-1 resize-none"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={pending}
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-400 hover:text-rodeo-600"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
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
        title="Delete this post?"
        description="This removes it permanently, including from the public site if it's published. This can't be undone."
        confirmLabel="Delete"
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={remove}
      />
    </div>
  );
}
