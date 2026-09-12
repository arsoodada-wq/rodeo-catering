import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const routes = [
  "",
  "/catering",
  "/corporate-catering",
  "/live-cookout-catering",
  "/birthday-party-catering",
  "/graduation-catering",
  "/wedding-catering",
  "/school-catering",
  "/sports-team-catering",
  "/party-catering",
  "/large-group-catering",
  "/burger-catering",
  "/chicken-catering",
  "/about",
  "/blog",
];

async function getActiveServiceAreaSlugs(): Promise<string[]> {
  try {
    const areas = await db.serviceArea.findMany({ where: { active: true }, select: { slug: true } });
    return areas.map((a) => a.slug);
  } catch {
    return [];
  }
}

async function getPublishedBlogSlugs(): Promise<string[]> {
  try {
    const posts = await db.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true } });
    return posts.map((p) => p.slug);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
    priority: route === "" ? 1 : route === "/catering" ? 0.9 : 0.7,
  }));

  const locationSlugs = await getActiveServiceAreaSlugs();
  const locationEntries = locationSlugs.map((slug) => ({
    url: `${siteUrl}/catering/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogSlugs = await getPublishedBlogSlugs();
  const blogEntries = blogSlugs.map((slug) => ({
    url: `${siteUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...locationEntries, ...blogEntries];
}
