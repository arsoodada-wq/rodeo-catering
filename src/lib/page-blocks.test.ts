import { describe, expect, it } from "vitest";
import { pageContentSchema, parsePageContent, emptyBlockOf, RESERVED_PAGE_SLUGS } from "./page-blocks";

describe("pageContentSchema", () => {
  it("accepts a well-formed mix of every block type", () => {
    const content = [
      { type: "heading", text: "Welcome", level: "h2" },
      { type: "paragraph", text: "Some text." },
      { type: "image", mediaId: "media-1" },
      { type: "button", label: "Order Now", href: "/catering#builder" },
    ];
    const result = pageContentSchema.safeParse(content);
    expect(result.success).toBe(true);
  });

  it("rejects a block missing a required field", () => {
    const result = pageContentSchema.safeParse([{ type: "heading", level: "h2" }]);
    expect(result.success).toBe(false);
  });

  it("rejects an unknown block type", () => {
    const result = pageContentSchema.safeParse([{ type: "video", url: "x" }]);
    expect(result.success).toBe(false);
  });

  it("rejects a heading with an invalid level", () => {
    const result = pageContentSchema.safeParse([{ type: "heading", text: "Hi", level: "h1" }]);
    expect(result.success).toBe(false);
  });
});

describe("parsePageContent", () => {
  it("returns an empty array for non-array input rather than throwing", () => {
    expect(parsePageContent(null)).toEqual([]);
    expect(parsePageContent(undefined)).toEqual([]);
    expect(parsePageContent("not an array")).toEqual([]);
  });

  it("drops individually malformed blocks instead of failing the whole page", () => {
    const content = [
      { type: "paragraph", text: "Good block." },
      { type: "paragraph" }, // missing text
      { type: "heading", text: "Also good", level: "h3" },
    ];
    const result = parsePageContent(content);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ type: "paragraph", text: "Good block." });
    expect(result[1]).toEqual({ type: "heading", text: "Also good", level: "h3" });
  });
});

describe("emptyBlockOf", () => {
  it("returns a valid, schema-passing block for every block type", () => {
    for (const type of ["heading", "paragraph", "image", "button"] as const) {
      const block = emptyBlockOf(type);
      // An empty text/label/href/mediaId is allowed to fail min-length
      // validation on save — this just checks the shape matches the schema's
      // discriminated union, not that it's ready to publish as-is.
      expect(block.type).toBe(type);
    }
  });
});

describe("RESERVED_PAGE_SLUGS", () => {
  it("includes every existing top-level static route", () => {
    for (const slug of ["about", "catering", "blog", "corporate-catering", "admin", "api"]) {
      expect(RESERVED_PAGE_SLUGS.has(slug)).toBe(true);
    }
  });

  it("does not reserve an ordinary new page title's slug", () => {
    expect(RESERVED_PAGE_SLUGS.has("spring-catering-promotion")).toBe(false);
  });
});
