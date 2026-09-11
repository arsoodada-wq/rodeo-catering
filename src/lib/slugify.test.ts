import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and hyphenates a city/state pair", () => {
    expect(slugify("Palos Heights", "IL")).toBe("palos-heights-il");
  });

  it("collapses punctuation and whitespace into single hyphens", () => {
    expect(slugify("O'Fallon", "IL")).toBe("o-fallon-il");
    expect(slugify("St.  Louis", "MO")).toBe("st-louis-mo");
  });

  it("never produces a leading or trailing hyphen", () => {
    expect(slugify("  Worth  ", "IL")).toBe("worth-il");
  });

  it("works with a single part", () => {
    expect(slugify("Chicago")).toBe("chicago");
  });
});
