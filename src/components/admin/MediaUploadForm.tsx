"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { uploadMedia } from "@/app/actions/media";

export function MediaUploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await uploadMedia(formData);
      if (res.ok) {
        formRef.current?.reset();
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="rounded-2xl border border-dashed border-ink-900/20 bg-cream-100/50 p-5"
    >
      <p className="text-sm font-semibold text-ink-900">Upload an image</p>
      <p className="mt-1 text-xs text-ink-400">JPEG, PNG, WebP, GIF, or SVG — up to 4MB.</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          required
          className="input sm:col-span-2"
        />
        <input name="altText" placeholder="Alt text (for accessibility & SEO)" className="input" />
        <input name="category" placeholder="Category (optional, e.g. menu, blog)" className="input" />
        <input name="caption" placeholder="Caption (optional)" className="input sm:col-span-2" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-3 flex items-center gap-1.5 rounded-full bg-rodeo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rodeo-600 disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        Upload
      </button>
      {error && <p className="mt-2 text-xs text-rodeo-600">{error}</p>}
    </form>
  );
}
