import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { db } from "@/lib/db";
import { getPublishedPageBySlug } from "@/lib/public-data";
import { parsePageContent } from "@/lib/page-blocks";
import { PageBlocks } from "@/components/site/PageBlocks";
import { ogImagePath } from "@/lib/og-image";

/**
 * Catch-all for standalone Pages built at /admin/pages. Every existing
 * static route (about, catering, blog, ...) is a sibling directory at this
 * same level, and Next.js always prefers a literal segment match over a
 * dynamic one — so this only ever catches a slug with no matching static
 * route. createPage()/updatePage() additionally refuse any slug in
 * RESERVED_PAGE_SLUGS so a page can't be created that would silently
 * become unreachable this way.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) return { title: "Page Not Found", robots: { index: false, follow: false } };

  const title = page.seoTitle || page.title;
  const description = page.seoDescription || undefined;
  const ogImage = ogImagePath(page.ogImageId);

  return {
    title,
    description,
    alternates: page.canonicalUrl ? { canonical: page.canonicalUrl } : undefined,
    robots: page.noindex ? { index: false, follow: false } : undefined,
    openGraph: ogImage ? { title, description, type: "website", images: [{ url: ogImage }] } : undefined,
  };
}

export default async function StandalonePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);

  if (!page) notFound();

  const blocks = parsePageContent(page.content);
  const mediaIds = [...new Set(blocks.filter((b) => b.type === "image").map((b) => b.mediaId))];

  const media =
    mediaIds.length > 0
      ? await db.media.findMany({
          where: { id: { in: mediaIds } },
          select: { id: true, url: true, altText: true },
        })
      : [];
  const mediaLookup = Object.fromEntries(media.map((m) => [m.id, m]));

  return (
    <Container className="max-w-2xl py-16 md:py-20">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
        {page.h1 || page.title}
      </h1>
      <div className="mt-8">
        <PageBlocks blocks={blocks} media={mediaLookup} />
      </div>
    </Container>
  );
}
