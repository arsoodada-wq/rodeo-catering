import { describe, expect, it } from "vitest";
import { LeadStatus, QuoteStatus } from "@/generated/prisma/enums";
import { LEAD_STATUS_LABELS, LEAD_STATUS_TONES, QUOTE_STATUS_TONES } from "./status";

// These guard against the exact class of bug this project has hit before:
// a new enum value added to the schema without updating every place that
// maps it to display copy, so it silently falls back to a raw enum string
// or an "undefined" badge tone.
describe("status tone/label maps stay in sync with the schema", () => {
  const leadStatusValues = Object.values(LeadStatus);
  const quoteStatusValues = Object.values(QuoteStatus);

  it("has a label for every LeadStatus value, and no extras", () => {
    expect(Object.keys(LEAD_STATUS_LABELS).sort()).toEqual([...leadStatusValues].sort());
  });

  it("has a badge tone for every LeadStatus value, and no extras", () => {
    expect(Object.keys(LEAD_STATUS_TONES).sort()).toEqual([...leadStatusValues].sort());
  });

  it("has a badge tone for every QuoteStatus value, and no extras", () => {
    expect(Object.keys(QUOTE_STATUS_TONES).sort()).toEqual([...quoteStatusValues].sort());
  });
});
