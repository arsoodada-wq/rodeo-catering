import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { MediaCard } from "@/components/admin/MediaCard";
import { MediaUploadForm } from "@/components/admin/MediaUploadForm";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PERMISSIONS, hasPageAccess } from "@/lib/permissions";

async function getMedia() {
  try {
    const media = await db.media.findMany({ orderBy: { uploadedAt: "desc" } });
    return { ok: true as const, media };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminMediaPage() {
  if (!(await hasPageAccess(PERMISSIONS.CONTENT_MANAGE))) {
    return <AccessRestricted label="the media library" />;
  }

  const data = await getMedia();

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage media
          here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Media Library</h1>
      <p className="mt-1 text-sm text-ink-400">
        Upload images to use as a blog post&apos;s featured image or a standalone page&apos;s content
        images. Stored directly in the database — fine for the number of images this site actually
        needs; not meant for a high-volume photo gallery.
      </p>

      <div className="mt-6">
        <MediaUploadForm />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.media.map((item) => (
          <MediaCard
            key={item.id}
            id={item.id}
            filename={item.filename}
            url={item.url}
            altText={item.altText}
            caption={item.caption}
            category={item.category}
            sizeBytes={item.sizeBytes}
          />
        ))}
      </div>
      {data.media.length === 0 && (
        <p className="mt-4 text-sm text-ink-400">No images uploaded yet.</p>
      )}
    </div>
  );
}
