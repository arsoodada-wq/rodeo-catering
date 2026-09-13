import { describe, expect, it, vi, beforeEach } from "vitest";

const leadFindMany = vi.fn();
const quoteFindMany = vi.fn();
const outreachActivityFindMany = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    lead: { findMany: (...args: unknown[]) => leadFindMany(...args) },
    quote: { findMany: (...args: unknown[]) => quoteFindMany(...args) },
    outreachActivity: { findMany: (...args: unknown[]) => outreachActivityFindMany(...args) },
  },
}));

const sendEmail = vi.fn();
vi.mock("@/lib/email", () => ({ sendEmail: (...args: unknown[]) => sendEmail(...args) }));

import { buildFollowUpDigest, sendFollowUpDigestEmail } from "./reminders";

const ORIGINAL_ENV = { ...process.env };

describe("buildFollowUpDigest", () => {
  beforeEach(() => {
    leadFindMany.mockReset();
    quoteFindMany.mockReset();
    outreachActivityFindMany.mockReset();
    leadFindMany.mockResolvedValue([]);
    quoteFindMany.mockResolvedValue([]);
    outreachActivityFindMany.mockResolvedValue([]);
  });

  it("excludes leads in a terminal status from the query", async () => {
    await buildFollowUpDigest();
    const where = leadFindMany.mock.calls[0][0].where;
    expect(where.status.notIn).toEqual(["COMPLETED", "LOST"]);
  });

  it("only asks for quotes still awaiting a customer response", async () => {
    await buildFollowUpDigest();
    const where = quoteFindMany.mock.calls[0][0].where;
    expect(where.status.in).toEqual(["SENT", "VIEWED"]);
  });

  it("excludes outreach contacts already resolved one way or the other", async () => {
    await buildFollowUpDigest();
    const where = outreachActivityFindMany.mock.calls[0][0].where;
    expect(where.outreachContact.status.notIn).toEqual(["LINK_ACQUIRED", "NOT_INTERESTED"]);
  });

  it("maps each source into the digest shape", async () => {
    const followUpDate = new Date("2026-01-01");
    leadFindMany.mockResolvedValue([{ id: "lead-1", name: "Jane", status: "FOLLOW_UP", followUpDate }]);
    quoteFindMany.mockResolvedValue([
      { id: "quote-1", quoteNumber: "Q-1", expiresAt: followUpDate, total: { toString: () => "100.00" }, lead: { name: "Jane" } },
    ]);
    outreachActivityFindMany.mockResolvedValue([
      {
        outreachContactId: "contact-1",
        type: "email",
        followUpDate,
        outreachContact: { organization: "Chamber" },
      },
    ]);

    const digest = await buildFollowUpDigest();

    expect(digest.leads).toEqual([{ id: "lead-1", name: "Jane", status: "FOLLOW_UP", followUpDate }]);
    expect(digest.expiringQuotes).toEqual([
      { id: "quote-1", quoteNumber: "Q-1", leadName: "Jane", expiresAt: followUpDate, total: "100.00" },
    ]);
    expect(digest.outreach).toEqual([
      { contactId: "contact-1", organization: "Chamber", followUpDate, activityType: "email" },
    ]);
  });
});

describe("sendFollowUpDigestEmail", () => {
  beforeEach(() => {
    leadFindMany.mockReset();
    quoteFindMany.mockReset();
    outreachActivityFindMany.mockReset();
    leadFindMany.mockResolvedValue([]);
    quoteFindMany.mockResolvedValue([]);
    outreachActivityFindMany.mockResolvedValue([]);
    sendEmail.mockReset();
    process.env = { ...ORIGINAL_ENV, ADMIN_NOTIFICATION_EMAIL: "owner@example.com" };
  });

  it("sends nothing when nothing is due — a daily empty email trains people to ignore it", async () => {
    const { sent } = await sendFollowUpDigestEmail();
    expect(sent).toBe(false);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("sends nothing when there's no admin email configured, even if items are due", async () => {
    delete process.env.ADMIN_NOTIFICATION_EMAIL;
    leadFindMany.mockResolvedValue([{ id: "lead-1", name: "Jane", status: "FOLLOW_UP", followUpDate: new Date() }]);
    const { sent } = await sendFollowUpDigestEmail();
    expect(sent).toBe(false);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("sends a digest email listing what's due when something is", async () => {
    leadFindMany.mockResolvedValue([
      { id: "lead-1", name: "Jane Doe", status: "FOLLOW_UP", followUpDate: new Date("2026-01-01") },
    ]);
    const { sent } = await sendFollowUpDigestEmail();
    expect(sent).toBe(true);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const call = sendEmail.mock.calls[0][0];
    expect(call.to).toBe("owner@example.com");
    expect(call.text).toContain("Jane Doe");
    expect(call.text).toContain("LEADS DUE FOR FOLLOW-UP");
  });
});
