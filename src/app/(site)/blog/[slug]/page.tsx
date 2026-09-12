import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { getPublishedBlogPostBySlug } from "@/lib/public-data";
import { formatEventDate, excerpt } from "@/lib/format";
import { business } from "@/lib/site-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return { title: "Page Not Found", robots: { index: false, follow: false } };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || excerpt(post.content, 160);

  return {
    title,
    description,
    alternates: post.canonicalUrl ? { canonical: post.canonicalUrl } : undefined,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  // A draft, deleted, or nonexistent slug 404s rather than showing
  // anything — same reasoning as the service-area pages: never render a
  // page for content the business hasn't actually published.
  if (!post) notFound();

  const paragraphs = post.content.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified: new Date(post.updatedAt).toISOString(),
    author: { "@type": "Organization", name: business.cateringBrand },
    publisher: { "@type": "Organization", name: business.cateringBrand },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };

  return (
    <Container className="py-16 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-2xl">
        <Link
          href="/blog"
          className="flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-rodeo-600"
        >
          <ArrowLeft className="h-4 w-4" /> All guides
        </Link>

        {post.category && (
          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-rodeo-600">
            {post.category}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
          {post.title}
        </h1>
        {post.publishedAt && (
          <p className="mt-3 text-sm text-ink-400">{formatEventDate(post.publishedAt)}</p>
        )}

        <div className="mt-8 space-y-4 text-ink-600">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-ink-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <Button href="/catering#builder" size="lg" className="mt-10">
          Start Your Catering Order
        </Button>
      </div>
    </Container>
  );
}
