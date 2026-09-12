import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { SocialPostRow } from "@/components/admin/SocialPostRow";
import { NewSocialPostForm } from "@/components/admin/NewSocialPostForm";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PERMISSIONS, hasPageAccess } from "@/lib/permissions";

async function getSocialPosts() {
  try {
    const posts = await db.socialPost.findMany({
      orderBy: [{ scheduledDate: "asc" }, { createdAt: "desc" }],
    });
    return { ok: true as const, posts };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminSocialPage() {
  if (!(await hasPageAccess(PERMISSIONS.MARKETING_MANAGE))) {
    return <AccessRestricted label="the social content calendar" />;
  }

  const data = await getSocialPosts();

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage the
          content calendar here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Social Content Calendar</h1>
      <p className="mt-1 text-sm text-ink-400">
        Plan, draft, and track posts across platforms. This is an internal planning tool — publishing
        still happens directly on each platform; nothing here posts automatically.
      </p>

      <div className="mt-6 space-y-4">
        {data.posts.map((post) => (
          <SocialPostRow
            key={post.id}
            id={post.id}
            platform={post.platform}
            category={post.category}
            topic={post.topic}
            hook={post.hook}
            caption={post.caption}
            cta={post.cta}
            hashtags={post.hashtags}
            videoConcept={post.videoConcept}
            shotList={post.shotList}
            status={post.status}
            scheduledDate={post.scheduledDate}
            publishedUrl={post.publishedUrl}
            notes={post.notes}
          />
        ))}
        {data.posts.length === 0 && (
          <p className="text-sm text-ink-400">No posts planned yet. Add the first one below.</p>
        )}
        <NewSocialPostForm />
      </div>
    </div>
  );
}
