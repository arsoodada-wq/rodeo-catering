import { Link } from "next-view-transitions";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/Badge";
import { NewBlogPostForm } from "@/components/admin/NewBlogPostForm";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PERMISSIONS, hasPageAccess } from "@/lib/permissions";

async function getPosts() {
  try {
    const posts = await db.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
    return { ok: true as const, posts };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminBlogPage() {
  if (!(await hasPageAccess(PERMISSIONS.CONTENT_MANAGE))) {
    return <AccessRestricted label="the blog" />;
  }

  const data = await getPosts();

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage blog
          posts here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Blog</h1>
      <p className="mt-1 text-sm text-ink-400">
        Planning guides and articles that live at <code>/blog</code> — a draft is never shown on
        the public site until you set it to Published.
      </p>

      <div className="mt-6 space-y-2">
        {data.posts.map((post) => (
          <Link
            key={post.id}
            href={`/admin/blog/${post.id}`}
            className="flex items-center justify-between gap-4 rounded-2xl border border-ink-900/8 bg-white p-4 hover:border-rodeo-200"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink-900">{post.title}</p>
              <p className="truncate text-xs text-ink-400">
                /blog/{post.slug}
                {post.category ? ` · ${post.category}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Badge tone={post.status === "PUBLISHED" ? "success" : "neutral"}>
                {post.status === "PUBLISHED" ? "Published" : "Draft"}
              </Badge>
              <ChevronRight className="h-4 w-4 text-ink-300" />
            </div>
          </Link>
        ))}
        {data.posts.length === 0 && (
          <p className="text-sm text-ink-400">No posts yet. Write the first one below.</p>
        )}
        <NewBlogPostForm />
      </div>
    </div>
  );
}
