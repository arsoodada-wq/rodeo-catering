"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const itemSchema = z.object({
  description: z.string().min(1, "Every line item needs a description"),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
});

const createQuoteSchema = z.object({
  leadId: z.string().min(1),
  items: z.array(itemSchema).min(1, "Add at least one line item"),
  fees: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  depositAmount: z.number().min(0).optional(),
  termsText: z.string().optional(),
  expiresAt: z.string().optional(),
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;

export async function createQuote(input: CreateQuoteInput) {
  const session = await auth();
  if (!session?.user) return { ok: false as const, error: "Not authenticated." };

  const parsed = createQuoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { leadId, items, fees, discount, tax, depositAmount, termsText, expiresAt } = parsed.data;

  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const total = Math.max(0, subtotal + fees + tax - discount);

  try {
    const lead = await db.lead.findUnique({ where: { id: leadId } });
    if (!lead) return { ok: false as const, error: "Lead not found." };

    const count = await db.quote.count();
    const quoteNumber = `Q-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const quote = await db.quote.create({
      data: {
        quoteNumber,
        leadId,
        status: "SENT",
        subtotal,
        fees,
        discount,
        tax,
        total,
        depositAmount: depositAmount ?? undefined,
        balanceAmount: depositAmount !== undefined ? total - depositAmount : undefined,
        termsText: termsText || undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        sentAt: new Date(),
        items: {
          create: items.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            lineTotal: i.quantity * i.unitPrice,
          })),
        },
      },
    });

    if (lead.status === "NEW" || lead.status === "CONTACTED") {
      await db.lead.update({ where: { id: leadId }, data: { status: "QUOTE_SENT" } });
    }

    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/leads");
    revalidatePath("/admin/quotes");
    return { ok: true as const, secureToken: quote.secureToken };
  } catch {
    return { ok: false as const, error: "Could not create this quote." };
  }
}
