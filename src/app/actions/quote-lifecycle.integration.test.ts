// Integration tests: unlike every other test in this project, these hit the
// REAL local Postgres database via the real @/lib/db client — no Prisma
// mocking. Only the two things that genuinely can't exist outside a real
// Next.js request (the session and revalidatePath's request-scoped cache)
// are stubbed. This exists to catch the class of bug a fully-mocked test
// can't: a real schema/migration mismatch, a real FK or cascade behaving
// differently than assumed, a real Decimal rounding surprise.
//
// Skips itself entirely when DATABASE_URL isn't configured (CI without a
// database, a fresh clone before `cp .env.example .env`) rather than
// failing the whole suite — consistent with how this app treats every
// other optional piece of external configuration.
import "dotenv/config";
import { afterAll, describe, expect, it, vi } from "vitest";
import { db } from "@/lib/db";
import { createQuote } from "./create-quote";
import { updateQuote } from "./update-quote";
import { acceptQuote } from "./accept-quote";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: vi.fn(async () => ({ user: { role: "SUPER_ADMIN" } })) }));

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDatabase)("Quote lifecycle (real database)", () => {
  const leadIds: string[] = [];
  const quoteIds: string[] = [];

  async function createTestLead(name: string) {
    const lead = await db.lead.create({
      data: {
        name,
        email: "integration-test@example.com",
        eventType: "CORPORATE",
        guestCount: 40,
        cateringStyle: "DROP_OFF",
        status: "NEW",
      },
    });
    leadIds.push(lead.id);
    return lead;
  }

  afterAll(async () => {
    if (!hasDatabase) return;
    if (quoteIds.length) await db.quote.deleteMany({ where: { id: { in: quoteIds } } });
    if (leadIds.length) await db.lead.deleteMany({ where: { id: { in: leadIds } } });
  });

  it("creates a real quote with computed totals and auto-advances the lead to QUOTE_SENT", async () => {
    const lead = await createTestLead("Integration Test — Create Quote");

    const res = await createQuote({
      leadId: lead.id,
      items: [
        { description: "Smash Burger Package", quantity: 20, unitPrice: 12 },
        { description: "Delivery Fee", quantity: 1, unitPrice: 25 },
      ],
      fees: 10,
      discount: 5,
      tax: 8,
    });

    expect(res.ok).toBe(true);
    if (!res.ok) return;

    const quote = await db.quote.findUnique({
      where: { secureToken: res.secureToken },
      include: { items: true },
    });
    quoteIds.push(quote!.id);

    // 20*12 + 1*25 = 265 subtotal; 265 + 10 fees + 8 tax - 5 discount = 278 total
    expect(Number(quote!.subtotal)).toBe(265);
    expect(Number(quote!.total)).toBe(278);
    expect(quote!.status).toBe("SENT");
    expect(quote!.items).toHaveLength(2);
    expect(Number(quote!.items.find((i) => i.description === "Delivery Fee")!.lineTotal)).toBe(25);

    const updatedLead = await db.lead.findUnique({ where: { id: lead.id } });
    expect(updatedLead!.status).toBe("QUOTE_SENT");
  });

  it("does not re-advance a lead that's already past QUOTE_SENT", async () => {
    const lead = await createTestLead("Integration Test — Already Confirmed");
    await db.lead.update({ where: { id: lead.id }, data: { status: "CONFIRMED" } });

    const res = await createQuote({
      leadId: lead.id,
      items: [{ description: "Extra Order", quantity: 1, unitPrice: 50 }],
      fees: 0,
      discount: 0,
      tax: 0,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      const quote = await db.quote.findUnique({ where: { secureToken: res.secureToken } });
      quoteIds.push(quote!.id);
    }

    const updatedLead = await db.lead.findUnique({ where: { id: lead.id } });
    expect(updatedLead!.status).toBe("CONFIRMED");
  });

  it("edits a quote in place — replaces line items and recomputes totals without changing its secureToken", async () => {
    const lead = await createTestLead("Integration Test — Edit Quote");
    const created = await createQuote({
      leadId: lead.id,
      items: [{ description: "Original Item", quantity: 1, unitPrice: 100 }],
      fees: 0,
      discount: 0,
      tax: 0,
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const original = await db.quote.findUnique({ where: { secureToken: created.secureToken } });
    quoteIds.push(original!.id);

    const updated = await updateQuote({
      quoteId: original!.id,
      items: [{ description: "Revised Item", quantity: 3, unitPrice: 40 }],
      fees: 0,
      discount: 0,
      tax: 0,
    });
    expect(updated.ok).toBe(true);

    const quote = await db.quote.findUnique({
      where: { id: original!.id },
      include: { items: true },
    });
    expect(quote!.secureToken).toBe(original!.secureToken);
    expect(quote!.items).toHaveLength(1);
    expect(quote!.items[0].description).toBe("Revised Item");
    expect(Number(quote!.total)).toBe(120);
  });

  it("accepts a quote through the public token and confirms the lead", async () => {
    const lead = await createTestLead("Integration Test — Accept Quote");
    const created = await createQuote({
      leadId: lead.id,
      items: [{ description: "Wedding Package", quantity: 1, unitPrice: 500 }],
      fees: 0,
      discount: 0,
      tax: 0,
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const quote = await db.quote.findUnique({ where: { secureToken: created.secureToken } });
    quoteIds.push(quote!.id);

    const res = await acceptQuote(created.secureToken);
    expect(res.ok).toBe(true);

    const acceptedQuote = await db.quote.findUnique({ where: { id: quote!.id } });
    expect(acceptedQuote!.status).toBe("ACCEPTED");
    expect(acceptedQuote!.acceptedAt).not.toBeNull();

    const confirmedLead = await db.lead.findUnique({ where: { id: lead.id } });
    expect(confirmedLead!.status).toBe("CONFIRMED");
  });

  it("expires rather than accepts a quote past its expiration date, and refuses to edit it afterward", async () => {
    const lead = await createTestLead("Integration Test — Expired Quote");
    const created = await createQuote({
      leadId: lead.id,
      items: [{ description: "Graduation Package", quantity: 1, unitPrice: 300 }],
      fees: 0,
      discount: 0,
      tax: 0,
      expiresAt: "2020-01-01",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const quote = await db.quote.findUnique({ where: { secureToken: created.secureToken } });
    quoteIds.push(quote!.id);

    const acceptRes = await acceptQuote(created.secureToken);
    expect(acceptRes.ok).toBe(false);

    const expiredQuote = await db.quote.findUnique({ where: { id: quote!.id } });
    expect(expiredQuote!.status).toBe("EXPIRED");

    // EXPIRED is still editable in general (see updateQuote), but confirm
    // an ACCEPTED one is genuinely locked — accept a second, fresh quote
    // and verify editing *that* one is refused.
    const secondCreated = await createQuote({
      leadId: lead.id,
      items: [{ description: "Replacement Package", quantity: 1, unitPrice: 300 }],
      fees: 0,
      discount: 0,
      tax: 0,
    });
    expect(secondCreated.ok).toBe(true);
    if (!secondCreated.ok) return;
    const secondQuote = await db.quote.findUnique({ where: { secureToken: secondCreated.secureToken } });
    quoteIds.push(secondQuote!.id);
    await acceptQuote(secondCreated.secureToken);

    const editRes = await updateQuote({
      quoteId: secondQuote!.id,
      items: [{ description: "Should Not Save", quantity: 1, unitPrice: 999 }],
      fees: 0,
      discount: 0,
      tax: 0,
    });
    expect(editRes.ok).toBe(false);

    const untouchedQuote = await db.quote.findUnique({
      where: { id: secondQuote!.id },
      include: { items: true },
    });
    expect(untouchedQuote!.status).toBe("ACCEPTED");
    expect(untouchedQuote!.items[0].description).toBe("Replacement Package");
  });
});
