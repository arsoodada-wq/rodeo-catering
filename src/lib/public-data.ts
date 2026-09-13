import { db } from "@/lib/db";
import {
  award as fallbackAward,
  reviews as fallbackReviews,
  confirmedServiceAreas as fallbackServiceAreas,
} from "@/lib/site-content";

export type DisplayAward = { title: string; organization: string };
export type DisplayReview = { name: string; rating: number; text: string };

/**
 * Falls back to the static content only when the database is unreachable
 * or nothing is active/flagged for display — never fabricates an award
 * that isn't actually in the database or the verified fallback.
 */
export async function getHomepageAward(): Promise<DisplayAward> {
  try {
    const award = await db.awardRecognition.findFirst({
      where: { active: true, displayHomepage: true },
      orderBy: { sortOrder: "asc" },
    });
    if (!award) return fallbackAward;
    return { title: award.title, organization: award.organization };
  } catch {
    return fallbackAward;
  }
}

export async function getActiveReviews(): Promise<DisplayReview[]> {
  try {
    const reviews = await db.review.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
    if (reviews.length === 0) return [...fallbackReviews];
    return reviews.map((r) => ({ name: r.customerName, rating: r.rating, text: r.reviewText }));
  } catch {
    return [...fallbackReviews];
  }
}

export async function getConfirmedServiceAreas(): Promise<string[]> {
  try {
    const areas = await db.serviceArea.findMany({
      where: { active: true },
      orderBy: { city: "asc" },
    });
    if (areas.length === 0) return [...fallbackServiceAreas];
    return areas.map((a) => `${a.city}, ${a.state}`);
  } catch {
    return [...fallbackServiceAreas];
  }
}

export async function getPublishedBlogPosts() {
  try {
    return await db.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { featuredImage: true },
    });
  } catch {
    return [];
  }
}

export async function getPublishedBlogPostBySlug(slug: string) {
  try {
    const post = await db.blogPost.findUnique({ where: { slug }, include: { featuredImage: true } });
    if (!post || post.status !== "PUBLISHED") return null;
    return post;
  } catch {
    return null;
  }
}

export async function getPublishedPageBySlug(slug: string) {
  try {
    const page = await db.page.findUnique({ where: { slug } });
    if (!page || page.status !== "PUBLISHED") return null;
    return page;
  } catch {
    return null;
  }
}
