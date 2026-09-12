"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { updateSocialPost, deleteSocialPost } from "@/app/actions/social-posts";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { Badge } from "@/components/ui/Badge";
import { SOCIAL_STATUS_LABELS, SOCIAL_STATUS_TONES } from "@/lib/status";
import { cn } from "@/lib/cn";

const PLATFORMS = ["INSTAGRAM", "FACEBOOK", "TIKTOK", "YOUTUBE", "YOUTUBE_SHORTS"] as const;
const STATUSES = ["IDEA", "DRAFT", "APPROVED", "SCHEDULED", "PUBLISHED"] as const;

function toDateInputValue(date: Date | string | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

type Props = {
  id: string;
  platform: string;
  category: string | null;
  topic: string | null;
  hook: string | null;
  caption: string | null;
  cta: string | null;
  hashtags: string[];
  videoConcept: string | null;
  shotList: string | null;
  status: string;
  scheduledDate: Date | string | null;
  publishedUrl: string | null;
  notes: string | null;
};

export function SocialPostRow(post: Props) {
  const [platform, setPlatform] = useState(post.platform);
  const [category, setCategory] = useState(post.category ?? "");
  const [topic, setTopic] = useState(post.topic ?? "");
  const [hook, setHook] = useState(post.hook ?? "");
  const [caption, setCaption] = useState(post.caption ?? "");
  const [cta, setCta] = useState(post.cta ?? "");
  const [hashtags, setHashtags] = useState(post.hashtags.join(", "));
  const [videoConcept, setVideoConcept] = useState(post.videoConcept ?? "");
  const [shotList, setShotList] = useState(post.shotList ?? "");
  const [status, setStatus] = useState(post.status);
  const [scheduledDate, setScheduledDate] = useState(toDateInputValue(post.scheduledDate));
  const [publishedUrl, setPublishedUrl] = useState(post.publishedUrl ?? "");
  const [notes, setNotes] = useState(post.notes ?? "");

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
      const res = await updateSocialPost({
        id: post.id,
        platform: platform as (typeof PLATFORMS)[number],
        category,
        topic,
        hook,
        caption,
        cta,
        hashtags,
        videoConcept,
        shotList,
        status: status as (typeof STATUSES)[number],
        scheduledDate,
        publishedUrl,
        notes,
      });
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
      const res = await deleteSocialPost({ id: post.id });
      if (res.ok) {
        setDeleted(true);
        showToast("Post removed from the calendar.", "success");
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={SOCIAL_STATUS_TONES[status]}>{SOCIAL_STATUS_LABELS[status]}</Badge>
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            {platform.replace("_", " ")}
          </span>
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={pending}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-400 hover:text-rodeo-600"
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="input mt-1">
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input mt-1">
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {SOCIAL_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Scheduled date
          </label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="input mt-1"
          />
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
            placeholder="food, behind-the-scenes, testimonial..."
            className="input mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Topic (optional)
          </label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} className="input mt-1" />
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Hook (optional)
          </label>
          <input value={hook} onChange={(e) => setHook(e.target.value)} className="input mt-1" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Call to action (optional)
          </label>
          <input value={cta} onChange={(e) => setCta(e.target.value)} className="input mt-1" />
        </div>
      </div>

      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Caption (optional)
      </label>
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        rows={2}
        className="input mt-1 resize-none"
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Video concept (optional)
          </label>
          <textarea
            value={videoConcept}
            onChange={(e) => setVideoConcept(e.target.value)}
            rows={2}
            className="input mt-1 resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Shot list (optional)
          </label>
          <textarea
            value={shotList}
            onChange={(e) => setShotList(e.target.value)}
            rows={2}
            className="input mt-1 resize-none"
          />
        </div>
      </div>

      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-400">
        Hashtags (comma-separated, optional)
      </label>
      <input
        value={hashtags}
        onChange={(e) => setHashtags(e.target.value)}
        placeholder="#catering, #worthil, #smashburgers"
        className="input mt-1"
      />

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Published URL (optional)
          </label>
          <input
            value={publishedUrl}
            onChange={(e) => setPublishedUrl(e.target.value)}
            className="input mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
            Notes (optional)
          </label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} className="input mt-1" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
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

      <ConfirmDialog
        open={confirmOpen}
        title="Remove this post?"
        description="This removes it from the content calendar. This can't be undone."
        confirmLabel="Delete"
        pending={pending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={remove}
      />
    </div>
  );
}
