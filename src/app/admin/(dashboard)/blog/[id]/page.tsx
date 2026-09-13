import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { BlogPostEditor } from "@/components/admin/BlogPostEditor";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PERMISSIONS, hasPageAccess } from "@/lib/permissions";

async function getPost(id: string) {
  try {
    const post = await db.blogPost.findUnique({ where: { id } });
    return { ok: true as const, post };
  } catch {
    return { ok: false as const, post: null };
  }
}

export default async function AdminBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await hasPageAccess(PERMISSIONS.CONTENT_MANAGE))) {
    return <AccessRestricted label="the blog" />;
  }

  const { id } = await params;
  const data = await getPost(id);

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage this
          post here.
        </p>
      </div>
    );
  }

  if (!data.post) notFound();

  return (
    <div>
      <Link
        href="/admin/blog"
        className="flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-ink-600"
      >
        <ArrowLeft className="h-4 w-4" /> Back to blog
      </Link>

      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-900">{data.post.title}</h1>

      <div className="mt-6">
        <BlogPostEditor
          id={data.post.id}
          title={data.post.title}
          slug={data.post.slug}
          category={data.post.category}
          tags={data.post.tags}
          content={data.post.content}
          featuredImageId={data.post.featuredImageId}
          ogImageId={data.post.ogImageId}
          seoTitle={data.post.seoTitle}
          seoDescription={data.post.seoDescription}
          canonicalUrl={data.post.canonicalUrl}
          status={data.post.status}
          publishedAt={data.post.publishedAt}
        />
      </div>
    </div>
  );
}
