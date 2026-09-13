import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { formatEventDate } from "@/lib/format";
import { LeadStatus, OutreachStatus, QuoteStatus } from "@/generated/prisma/enums";

const LEAD_TERMINAL_STATUSES = [LeadStatus.COMPLETED, LeadStatus.LOST];
const OUTREACH_TERMINAL_STATUSES = [OutreachStatus.LINK_ACQUIRED, OutreachStatus.NOT_INTERESTED];
const QUOTE_EXPIRING_WINDOW_DAYS = 2;

export type FollowUpDigest = {
  leads: { id: string; name: string; status: string; followUpDate: Date }[];
  expiringQuotes: {
    id: string;
    quoteNumber: string;
    leadName: string | null;
    expiresAt: Date;
    total: string;
  }[];
  outreach: { contactId: string; organization: string; followUpDate: Date; activityType: string }[];
};

/**
 * Pulls together everything actually due for a human follow-up today,
 * across three tables that each already had a followUpDate/expiresAt field
 * sitting unused (Lead.followUpDate had no UI at all before this; Quote
 * expiration was only checked reactively on accept/edit, never proactively
 * surfaced; OutreachActivity.followUpDate had UI to set it — Phase 9 — but
 * nothing ever read it back). `lte: now` (not an exact-day match) so an
 * item that was missed yesterday keeps appearing rather than silently
 * dropping off the list.
 */
export async function buildFollowUpDigest(now: Date = new Date()): Promise<FollowUpDigest> {
  const soon = new Date(now.getTime() + QUOTE_EXPIRING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [leads, quotes, activities] = await Promise.all([
    db.lead.findMany({
      where: { followUpDate: { lte: now }, status: { notIn: LEAD_TERMINAL_STATUSES } },
      orderBy: { followUpDate: "asc" },
    }),
    db.quote.findMany({
      where: {
        status: { in: [QuoteStatus.SENT, QuoteStatus.VIEWED] },
        expiresAt: { lte: soon },
      },
      include: { lead: true },
      orderBy: { expiresAt: "asc" },
    }),
    db.outreachActivity.findMany({
      where: {
        followUpDate: { lte: now },
        outreachContact: { status: { notIn: OUTREACH_TERMINAL_STATUSES } },
      },
      include: { outreachContact: true },
      orderBy: { followUpDate: "asc" },
    }),
  ]);

  return {
    leads: leads.map((lead) => ({
      id: lead.id,
      name: lead.name,
      status: lead.status,
      followUpDate: lead.followUpDate!,
    })),
    expiringQuotes: quotes.map((quote) => ({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      leadName: quote.lead?.name ?? null,
      expiresAt: quote.expiresAt!,
      total: quote.total.toString(),
    })),
    outreach: activities.map((activity) => ({
      contactId: activity.outreachContactId,
      organization: activity.outreachContact.organization,
      followUpDate: activity.followUpDate!,
      activityType: activity.type,
    })),
  };
}

function digestItemCount(digest: FollowUpDigest): number {
  return digest.leads.length + digest.expiringQuotes.length + digest.outreach.length;
}

/**
 * Sends nothing on a day with nothing due — a digest that arrives every
 * single day regardless of content trains the reader to stop opening it.
 * Returns the digest either way so a caller (the cron route) can report
 * what it found even when no email went out.
 */
export async function sendFollowUpDigestEmail(): Promise<{ sent: boolean; digest: FollowUpDigest }> {
  const digest = await buildFollowUpDigest();
  const total = digestItemCount(digest);

  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (total === 0 || !to) {
    return { sent: false, digest };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const sections: string[] = [];

  if (digest.leads.length > 0) {
    sections.push(
      `LEADS DUE FOR FOLLOW-UP (${digest.leads.length})\n` +
        digest.leads
          .map(
            (lead) =>
              `- ${lead.name} (${lead.status}) — due ${formatEventDate(lead.followUpDate)} — ${siteUrl}/admin/leads/${lead.id}`
          )
          .join("\n")
    );
  }

  if (digest.expiringQuotes.length > 0) {
    sections.push(
      `QUOTES EXPIRING SOON (${digest.expiringQuotes.length})\n` +
        digest.expiringQuotes
          .map(
            (quote) =>
              `- ${quote.quoteNumber}${quote.leadName ? ` for ${quote.leadName}` : ""} — $${quote.total} — expires ${formatEventDate(quote.expiresAt)} — ${siteUrl}/admin/quotes/${quote.id}`
          )
          .join("\n")
    );
  }

  if (digest.outreach.length > 0) {
    sections.push(
      `OUTREACH FOLLOW-UPS DUE (${digest.outreach.length})\n` +
        digest.outreach
          .map(
            (outreach) =>
              `- ${outreach.organization} (${outreach.activityType}) — due ${formatEventDate(outreach.followUpDate)} — ${siteUrl}/admin/outreach/${outreach.contactId}`
          )
          .join("\n")
    );
  }

  const text = sections.join("\n\n");
  const html = `<pre style="font-family: inherit; white-space: pre-wrap; margin: 0;">${text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!)}</pre>`;

  await sendEmail({
    to,
    subject: `Daily follow-up digest: ${total} item${total === 1 ? "" : "s"} need attention`,
    text,
    html,
  });

  return { sent: true, digest };
}
