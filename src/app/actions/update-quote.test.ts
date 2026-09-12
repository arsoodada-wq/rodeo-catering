import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

const findUnique = vi.fn();
const deleteMany = vi.fn();
const update = vi.fn();
const transaction = vi.fn(async (ops: unknown[]) => ops);

vi.mock("@/lib/db", () => ({
  db: {
    quote: {
      findUnique: (...args: unknown[]) => findUnique(...args),
      update: (...args: unknown[]) => update(...args),
    },
    quoteItem: {
      deleteMany: (...args: unknown[]) => deleteMany(...args),
    },
    $transaction: (ops: unknown[]) => transaction(ops),
  },
}));

vi.mock("@/lib/permissions", () => ({
  PERMISSIONS: { QUOTES_MANAGE: "quotes.manage" },
  requirePermission: vi.fn(async () => ({ ok: true as const })),
}));

import { updateQuote } from "./update-quote";

const baseInput = {
  quoteId: "quote-1",
  items: [{ description: "Smash Burger Package", quantity: 20, unitPrice: 12 }],
  fees: 0,
  discount: 0,
  tax: 0,
};

describe("updateQuote", () => {
  beforeEach(() => {
    findUnique.mockReset();
    deleteMany.mockReset();
    update.mockReset();
    transaction.mockClear();
  });

  it("recomputes totals and keeps the same status for an editable quote", async () => {
    findUnique.mockResolvedValue({
      id: "quote-1",
      leadId: "lead-1",
      secureToken: "tok",
      status: "SENT",
    });

    const res = await updateQuote({ ...baseInput, fees: 10 });
    expect(res.ok).toBe(true);
    expect(transaction).toHaveBeenCalledTimes(1);
    const updateCall = update.mock.calls[0][0];
    expect(updateCall.data.status).toBe("SENT");
    expect(updateCall.data.subtotal).toBe(240);
    expect(updateCall.data.total).toBe(250);
  });

  it("brings an EXPIRED quote back to SENT when edited", async () => {
    findUnique.mockResolvedValue({
      id: "quote-1",
      leadId: "lead-1",
      secureToken: "tok",
      status: "EXPIRED",
    });

    await updateQuote(baseInput);
    const updateCall = update.mock.calls[0][0];
    expect(updateCall.data.status).toBe("SENT");
  });

  it("refuses to edit a quote the customer already accepted", async () => {
    findUnique.mockResolvedValue({
      id: "quote-1",
      leadId: "lead-1",
      secureToken: "tok",
      status: "ACCEPTED",
    });

    const res = await updateQuote(baseInput);
    expect(res.ok).toBe(false);
    expect(transaction).not.toHaveBeenCalled();
  });

  it("refuses to edit a quote the customer already declined", async () => {
    findUnique.mockResolvedValue({
      id: "quote-1",
      leadId: "lead-1",
      secureToken: "tok",
      status: "DECLINED",
    });

    const res = await updateQuote(baseInput);
    expect(res.ok).toBe(false);
    expect(transaction).not.toHaveBeenCalled();
  });

  it("returns an error when the quote doesn't exist", async () => {
    findUnique.mockResolvedValue(null);
    const res = await updateQuote(baseInput);
    expect(res.ok).toBe(false);
  });
});
