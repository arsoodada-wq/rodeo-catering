"use server";

import { z } from "zod";
import { db } from "@/lib/db";

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
