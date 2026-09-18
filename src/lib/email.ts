/**
 * Thin wrapper over Resend's REST API (no SDK dependency needed for a
 * single-endpoint integration). Matches the "dev-safe default" already
 * documented in .env.example: with no RESEND_API_KEY, an email is logged
 * to the console instead of sent, so local dev and CI never need a real
 * key and never accidentally email anyone.
 */

import { getNotificationSettings } from "@/lib/notification-settings";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Rodeo Catering <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(
      `[email:not sent — RESEND_API_KEY unset] to=${input.to} subject="${input.subject}"\n${input.text}`
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: input.to, subject: input.subject, html: input.html, text: input.text }),
  });

  if (!res.ok) {
    throw new Error(`Resend API error (${res.status}): ${await res.text()}`);
  }
}

type NewLeadDetails = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  eventType: string;
  guestCount: number;
  eventDate?: Date | string | null;
  cateringStyle: string | null;
  notes?: string | null;
};

function formatEventType(eventType: string) {
  return eventType.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Fires on every new lead regardless of how it came in — the wizard and
 * the AI concierge both funnel through the same submitCateringLead action,
 * so this one call point covers both. Never let a notification failure
 * block or roll back the lead itself; the lead is already safely in the
 * database by the time this runs, and the admin can still see it in
 * /admin/leads even if this email never arrives.
 */
export async function sendNewLeadNotification(lead: NewLeadDetails): Promise<void> {
  const { email: to } = await getNotificationSettings();
  if (!to) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const eventDate = lead.eventDate
    ? new Date(lead.eventDate).toLocaleDateString(undefined, { timeZone: "UTC" })
    : "Not specified";

  const lines = [
    `Name: ${lead.name}`,
    lead.company ? `Company: ${lead.company}` : null,
    lead.email ? `Email: ${lead.email}` : null,
    lead.phone ? `Phone: ${lead.phone}` : null,
    `Event type: ${formatEventType(lead.eventType)}`,
    `Guest count: ${lead.guestCount}`,
    `Event date: ${eventDate}`,
    `Catering style: ${lead.cateringStyle ? formatEventType(lead.cateringStyle) : "Not specified"}`,
    lead.notes ? `Notes: ${lead.notes}` : null,
  ].filter((line): line is string => Boolean(line));

  const detailUrl = `${siteUrl}/admin/leads/${lead.id}`;

  await sendEmail({
    to,
    subject: `New catering lead: ${lead.name} (${lead.guestCount} guests)`,
    text: `${lines.join("\n")}\n\nView in the dashboard: ${detailUrl}`,
    html: `<p>${lines.join("<br>")}</p><p><a href="${detailUrl}">View in the dashboard</a></p>`,
  });
}
