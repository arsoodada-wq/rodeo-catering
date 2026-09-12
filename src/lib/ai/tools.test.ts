import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ db: {} }));
vi.mock("@/app/actions/submit-catering-lead", () => ({ submitCateringLead: vi.fn() }));
vi.mock("@/lib/public-data", () => ({ getConfirmedServiceAreas: vi.fn(async () => []) }));

import { executeConciergeTool } from "./tools";

describe("check_event_date tool", () => {
  it("rejects a date sooner than the minimum notice policy", async () => {
    const soon = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);
    const result = (await executeConciergeTool("check_event_date", { date: soon })) as {
      meetsMinimumNotice: boolean;
    };
    expect(result.meetsMinimumNotice).toBe(false);
  });

  it("accepts a date well beyond the minimum notice policy", async () => {
    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const result = (await executeConciergeTool("check_event_date", { date: future })) as {
      meetsMinimumNotice: boolean;
    };
    expect(result.meetsMinimumNotice).toBe(true);
  });

  it("rejects an unparseable date", async () => {
    const result = (await executeConciergeTool("check_event_date", { date: "not-a-date" })) as {
      valid: boolean;
    };
    expect(result.valid).toBe(false);
  });
});

describe("executeConciergeTool", () => {
  it("returns an error payload for an unknown tool name", async () => {
    const result = (await executeConciergeTool("delete_everything", {})) as { error: string };
    expect(result.error).toContain("Unknown tool");
  });
});
