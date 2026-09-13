import { describe, expect, it, vi, beforeEach } from "vitest";

const create = vi.fn();
vi.mock("@/lib/db", () => ({
  db: { lead: { create: (...args: unknown[]) => create(...args) } },
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.1" }),
}));

vi.mock("@/lib/rate-limit", async () => {
  const actual = await vi.importActual<typeof import("@/lib/rate-limit")>("@/lib/rate-limit");
  return actual;
});

const sendNewLeadNotification = vi.fn();
vi.mock("@/lib/email", () => ({ sendNewLeadNotification: (...args: unknown[]) => sendNewLeadNotification(...args) }));

import { submitCateringLead } from "./submit-catering-lead";
import { _resetRateLimitsForTests } from "@/lib/rate-limit";

const baseInput = {
  eventType: "CORPORATE" as const,
  guestCount: 20,
  cateringStyle: "PICKUP" as const,
  foodSelections: [],
  name: "Jane Doe",
  email: "jane@example.com",
};

describe("submitCateringLead", () => {
  beforeEach(() => {
    create.mockReset();
    create.mockResolvedValue({ id: "lead-1" });
    sendNewLeadNotification.mockReset();
    sendNewLeadNotification.mockResolvedValue(undefined);
    _resetRateLimitsForTests();
  });

  it("creates a real lead for a normal submission", async () => {
    const res = await submitCateringLead({ ...baseInput, formStartedAtMs: Date.now() - 10_000 });
    expect(res.ok).toBe(true);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it("defaults to CATERING_WIZARD when no source is given", async () => {
    await submitCateringLead({ ...baseInput, formStartedAtMs: Date.now() - 10_000 });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ source: "CATERING_WIZARD" }) })
    );
  });

  it("records AI_CONCIERGE as the source when the concierge tool submits it", async () => {
    await submitCateringLead({
      ...baseInput,
      source: "AI_CONCIERGE",
      formStartedAtMs: Date.now() - 10_000,
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ source: "AI_CONCIERGE" }) })
    );
  });

  it("notifies the admin of the new lead, but a notification failure doesn't fail the submission", async () => {
    sendNewLeadNotification.mockRejectedValueOnce(new Error("Resend is down"));
    const res = await submitCateringLead({ ...baseInput, formStartedAtMs: Date.now() - 10_000 });
    expect(res.ok).toBe(true);
    expect(sendNewLeadNotification).toHaveBeenCalledWith(expect.objectContaining({ id: "lead-1" }));
  });

  it("silently ignores a submission with the honeypot field filled", async () => {
    const res = await submitCateringLead({
      ...baseInput,
      website: "http://spam.example",
      formStartedAtMs: Date.now() - 10_000,
    });
    expect(res.ok).toBe(true);
    expect(create).not.toHaveBeenCalled();
  });

  it("silently ignores a submission that arrives faster than a human could fill the wizard", async () => {
    const res = await submitCateringLead({ ...baseInput, formStartedAtMs: Date.now() });
    expect(res.ok).toBe(true);
    expect(create).not.toHaveBeenCalled();
  });

  it("rate-limits repeated submissions from the same IP", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await submitCateringLead({ ...baseInput, formStartedAtMs: Date.now() - 10_000 });
      expect(res.ok).toBe(true);
    }
    const sixth = await submitCateringLead({ ...baseInput, formStartedAtMs: Date.now() - 10_000 });
    expect(sixth.ok).toBe(false);
    expect(create).toHaveBeenCalledTimes(5);
  });
});
