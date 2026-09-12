"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendNewLeadNotification } from "@/lib/email";

const SUBMIT_LIMIT = 5;
const SUBMIT_WINDOW_MS = 60 * 60 * 1000;
const MIN_FILL_TIME_MS = 3000;

const leadSchema = z.object({
  eventType: z.enum([
    "CORPORATE",
    "BIRTHDAY",
    "GRADUATION",
    "WEDDING",
    "SCHOOL",
    "SPORTS_TEAM",
    "FAMILY_GATHERING",
    "COMMUNITY",
    "HOLIDAY",
    "OTHER",
  ]),
  guestCount: z.number().int().min(1).max(10000),
  eventDate: z.string().optional(),
  eventTime: z.string().optional(),
  cateringStyle: z.enum([
    "PICKUP",
    "DROP_OFF",
    "FULL_SERVICE",
    "LIVE_COOKOUT",
    "CORPORATE_LUNCH",
    "LARGE_EVENT",
  ]),
  foodSelections: z.array(z.string()).default([]),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  // Anti-spam signals, not real form fields — see CateringWizard.tsx.
  website: z.string().optional(),
  formStartedAtMs: z.number().optional(),
});

export type CateringLeadInput = z.infer<typeof leadSchema>;

export type SubmitLeadResult =
  | { ok: true; leadId: string }
  | { ok: false; error: string };

export async function submitCateringLead(
  input: CateringLeadInput
): Promise<SubmitLeadResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }
  const data = parsed.data;

  if (!data.email && !data.phone) {
    return { ok: false, error: "Please provide an email or phone number." };
  }

  // Bot signals: a filled honeypot field, or a submission faster than a
  // human could plausibly click through an 8-step wizard. Pretend success
  // without touching the database — telling a bot "rejected" just teaches
  // it to iterate, where a real customer never sees this path at all.
  const filledHoneypot = Boolean(data.website && data.website.trim() !== "");
  const submittedTooFast =
    data.formStartedAtMs !== undefined && Date.now() - data.formStartedAtMs < MIN_FILL_TIME_MS;
  if (filledHoneypot || submittedTooFast) {
    return { ok: true, leadId: "ignored" };
  }

  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "unknown";
  const { allowed } = checkRateLimit(`lead-submit:${ip}`, SUBMIT_LIMIT, SUBMIT_WINDOW_MS);
  if (!allowed) {
    return {
      ok: false,
      error: "Too many requests from this connection — please try again in a bit, or call us directly.",
    };
  }

  // Defense in depth: the wizard's date picker already greys out dates
  // sooner than the business's minimum notice. This check is deliberately
  // looser (24h vs. the wizard's 48h) so a legitimate client-approved date
  // is never rejected here over a client/server clock or timezone skew —
  // it only catches a request that bypassed the UI entirely.
  if (data.eventDate) {
    const eventTimestamp = new Date(data.eventDate).getTime();
    const minAllowed = Date.now() + 24 * 60 * 60 * 1000;
    if (!Number.isNaN(eventTimestamp) && eventTimestamp < minAllowed) {
      return {
        ok: false,
        error: "That date is too soon — catering orders need at least 48 hours notice.",
      };
    }
  }

  try {
    const lead = await db.lead.create({
      data: {
        name: data.name,
        company: data.company || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        eventType: data.eventType,
        guestCount: data.guestCount,
        eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
        eventTime: data.eventTime || undefined,
        cateringStyle: data.cateringStyle,
        street: data.street || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        zip: data.zip || undefined,
        foodSelections: data.foodSelections,
        notes: data.notes || undefined,
        source: "CATERING_WIZARD",
        status: "NEW",
      },
    });

    // Best-effort: the lead is already saved, so a notification failure
    // (bad Resend key, network blip) must never turn a successful
    // submission into an error for the customer.
    try {
      await sendNewLeadNotification(lead);
    } catch (err) {
      console.error("sendNewLeadNotification failed:", err);
    }

    return { ok: true, leadId: lead.id };
  } catch (err) {
    console.error("submitCateringLead failed:", err);
    const message =
      err instanceof Error && err.message.includes("DATABASE_URL")
        ? "Our booking system isn't fully connected yet — please call us directly and we'll get your event on the calendar."
        : "Something went wrong submitting your request. Please call us directly and we'll take it from there.";
    return { ok: false, error: message };
  }
}
