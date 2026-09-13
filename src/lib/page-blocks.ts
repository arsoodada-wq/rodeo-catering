import { z } from "zod";

/**
 * The Page model's `content Json` field (schema since Phase 2, unused
 * until now) is deliberately rendered as an ordered list of a small fixed
 * set of block types rather than a free-form drag-and-drop visual builder
 * — there's no business specification for what a "page builder" should
 * look like here, and guessing at a bigger, more elaborate UI risks
 * building something that doesn't match what's actually needed. This
 * gives the business real, working capability (a new standalone page with
 * no code deploy) without speculatively over-engineering the editor.
 */
export const pageBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text: z.string().min(1), level: z.enum(["h2", "h3"]) }),
  z.object({ type: z.literal("paragraph"), text: z.string().min(1) }),
  z.object({ type: z.literal("image"), mediaId: z.string().min(1) }),
  z.object({ type: z.literal("button"), label: z.string().min(1), href: z.string().min(1) }),
]);

export const pageContentSchema = z.array(pageBlockSchema);

export type PageBlock = z.infer<typeof pageBlockSchema>;

export const BLOCK_TYPE_LABELS: Record<PageBlock["type"], string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  image: "Image",
  button: "Button",
};

export function emptyBlockOf(type: PageBlock["type"]): PageBlock {
  switch (type) {
    case "heading":
      return { type: "heading", text: "", level: "h2" };
    case "paragraph":
      return { type: "paragraph", text: "" };
    case "image":
      return { type: "image", mediaId: "" };
    case "button":
      return { type: "button", label: "", href: "" };
  }
}

/**
 * Parses a Page.content JSON value into typed blocks for rendering,
 * silently dropping anything that doesn't validate rather than crashing
 * the page — content only ever gets there through updatePage's own
 * pageContentSchema.safeParse guard, so a malformed entry here would mean
 * either manual database editing or a future schema change, not normal
 * operation. A public page should degrade (skip one bad block), not 500.
 */
export function parsePageContent(content: unknown): PageBlock[] {
  if (!Array.isArray(content)) return [];
  const blocks: PageBlock[] = [];
  for (const item of content) {
    const parsed = pageBlockSchema.safeParse(item);
    if (parsed.success) blocks.push(parsed.data);
  }
  return blocks;
}

/**
 * Slugs that already resolve to a real route in the (site) group — a
 * standalone Page created with one of these would silently become
 * unreachable, since Next.js always prefers the literal, more specific
 * route over the [slug] catch-all at the same level. Kept in sync by hand
 * with src/app/(site)/*; add to this list whenever a new top-level static
 * route is added.
 */
export const RESERVED_PAGE_SLUGS = new Set([
  "",
  "about",
  "accessibility",
  "birthday-party-catering",
  "blog",
  "burger-catering",
  "catering",
  "chicken-catering",
  "corporate-catering",
  "graduation-catering",
  "large-group-catering",
  "live-cookout-catering",
  "party-catering",
  "privacy-policy",
  "quote",
  "school-catering",
  "sports-team-catering",
  "style-guide",
  "terms",
  "wedding-catering",
  "admin",
  "api",
]);
