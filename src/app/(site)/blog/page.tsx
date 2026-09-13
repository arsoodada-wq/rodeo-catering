import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { getPublishedBlogPosts } from "@/lib/public-data";
import { excerpt } from "@/lib/format";
import { resolvePageMetadata } from "@/lib/seo-overrides";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata("/blog");
}

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  if (posts.length === 0) {
    return (
      <Container className="py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">
          Catering Guides
        </p>
        <h1 className="mx-auto mt-2 max-w-lg text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
          Planning guides are coming soon.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-ink-400">
          We&apos;re putting together guides on planning food for parties,
          corporate events, and more. In the meantime, our catering team is
          happy to help directly.
        </p>
        <Button href="/catering#builder" size="lg" className="mt-8">
          Start Your Catering Order
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-16 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">
          Catering Guides
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
          Planning tips from our catering team
        </h1>
      </div>

      <div className="mx-auto mt-10 grid max-w-3xl gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="rounded-2xl border border-ink-900/8 bg-white p-6 transition-colors hover:border-rodeo-200"
          >
            {post.category && (
              <p className="text-xs font-semibold uppercase tracking-wide text-rodeo-600">
                {post.category}
              </p>
            )}
            <h2 className="mt-1 text-xl font-bold text-ink-900">{post.title}</h2>
            <p className="mt-2 text-sm text-ink-500">{excerpt(post.content)}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
