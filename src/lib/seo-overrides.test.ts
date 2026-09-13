import { describe, expect, it, vi, beforeEach } from "vitest";

const findUnique = vi.fn();
vi.mock("@/lib/db", () => ({ db: { siteSetting: { findUnique: (...args: unknown[]) => findUnique(...args) } } }));

import { resolvePageMetadata } from "./seo-overrides";

describe("resolvePageMetadata", () => {
  beforeEach(() => {
    findUnique.mockReset();
  });

  it("falls back to the registered default when no override exists", async () => {
    findUnique.mockResolvedValue(null);
    const result = await resolvePageMetadata("/catering");
    expect(result.title).toBe("Catering Near Worth, IL");
    expect(result.description).toMatch(/Request catering/);
  });

  it("uses the stored override in place of the default when one exists", async () => {
    findUnique.mockResolvedValue({
      key: "seo:/catering",
      value: { title: "Custom Title", description: "Custom description." },
    });
    const result = await resolvePageMetadata("/catering");
    expect(result.title).toBe("Custom Title");
    expect(result.description).toBe("Custom description.");
  });

  it("falls back to the default field-by-field when only one override field is set", async () => {
    findUnique.mockResolvedValue({ key: "seo:/catering", value: { title: "Only Title Overridden" } });
    const result = await resolvePageMetadata("/catering");
    expect(result.title).toBe("Only Title Overridden");
    expect(result.description).toMatch(/Request catering/);
  });

  it("falls back to the default when the database is unreachable, rather than throwing", async () => {
    findUnique.mockRejectedValue(new Error("connection refused"));
    const result = await resolvePageMetadata("/about");
    expect(result.title).toBe("About");
  });

  it("wraps the title as { absolute } only when useAbsoluteTitle is requested (homepage)", async () => {
    findUnique.mockResolvedValue(null);
    const result = await resolvePageMetadata("/", true);
    expect(result.title).toEqual({ absolute: "Rodeo Burgers & Chicken Catering | Worth, IL" });
  });

  it("throws for a path that isn't a registered managed page", async () => {
    await expect(resolvePageMetadata("/not-a-real-page")).rejects.toThrow(/not a registered/);
  });
});
