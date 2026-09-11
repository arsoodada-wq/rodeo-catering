import { describe, expect, it, afterEach } from "vitest";
import { formatEventDate } from "./format";

describe("formatEventDate", () => {
  const originalTz = process.env.TZ;

  afterEach(() => {
    process.env.TZ = originalTz;
  });

  it("keeps the stored calendar date even when the local timezone would shift it backward", () => {
    // Etc/GMT+12 is 12 hours behind UTC, so a naive local-timezone format of
    // a UTC-midnight date rolls it back to the previous day — this is
    // exactly the bug that shipped once already (see src/lib/format.ts).
    process.env.TZ = "Etc/GMT+12";

    const input = "2026-11-15"; // parses as 2026-11-15T00:00:00.000Z

    // Prove the bug scenario is real in this environment: formatting
    // without pinning UTC does shift the day backward.
    const naive = new Date(input).toLocaleDateString();
    expect(naive).toContain("14");

    // The actual function under test must not exhibit that shift.
    const fixed = formatEventDate(input);
    expect(fixed).toContain("15");
    expect(fixed).not.toContain("14");
  });

  it("is unaffected by the local timezone at all", () => {
    const input = "2026-01-01";

    process.env.TZ = "Etc/GMT+12";
    const inNegativeOffset = formatEventDate(input);

    process.env.TZ = "Pacific/Kiritimati"; // UTC+14
    const inPositiveOffset = formatEventDate(input);

    expect(inNegativeOffset).toBe(inPositiveOffset);
  });

  it("accepts a Date object as well as a string", () => {
    const asString = formatEventDate("2026-07-04");
    const asDate = formatEventDate(new Date("2026-07-04"));
    expect(asDate).toBe(asString);
  });
});
