import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const findUnique = vi.fn();
const update = vi.fn();
const leadUpdate = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    quote: {
      findUnique: (...args: unknown[]) => findUnique(...args),
      update: (...args: unknown[]) => update(...args),
    },
    lead: {
      update: (...args: unknown[]) => leadUpdate(...args),
    },
  },
}));

import { acceptQuote } from "./accept-quote";

const baseQuote = {
  id: "quote-1",
  leadId: "lead-1",
  status: "SENT",
  expiresAt: null as Date | null,
};

describe("acceptQuote", () => {
  beforeEach(() => {
    findUnique.mockReset();
    update.mockReset();
    leadUpdate.mockReset();
  });

  it("accepts a quote with no expiration set", async () => {
    findUnique.mockResolvedValue({ ...baseQuote });
    const res = await acceptQuote("token-1");
    expect(res.ok).toBe(true);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "ACCEPTED" }) })
    );
  });

  it("rejects and marks EXPIRED a quote whose expiresAt has already passed, even though its status is still SENT", async () => {
    findUnique.mockResolvedValue({ ...baseQuote, expiresAt: new Date(Date.now() - 60_000) });
    const res = await acceptQuote("token-1");
    expect(res.ok).toBe(false);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "EXPIRED" } })
    );
  });

  it("accepts a quote whose expiresAt is still in the future", async () => {
    findUnique.mockResolvedValue({ ...baseQuote, expiresAt: new Date(Date.now() + 60_000) });
    const res = await acceptQuote("token-1");
    expect(res.ok).toBe(true);
  });

  it("rejects an already-expired-status quote without re-checking dates", async () => {
    findUnique.mockResolvedValue({ ...baseQuote, status: "EXPIRED" });
    const res = await acceptQuote("token-1");
    expect(res.ok).toBe(false);
    expect(update).not.toHaveBeenCalled();
  });
});
