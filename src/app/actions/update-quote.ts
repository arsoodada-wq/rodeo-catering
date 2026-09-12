"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { PERMISSIONS, requirePermission } from "@/lib/permissions";
import { computeQuoteTotals } from "@/lib/quote-math";

const itemSchema = z.object({
  description: z.string().min(1, "Every line item needs a description"),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
});

const updateQuoteSchema = z.object({
  quoteId: z.string().min(1),
  items: z.array(itemSchema).min(1, "Add at least one line item"),
  fees: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  depositAmount: z.number().min(0).optional(),
  termsText: z.string().optional(),
  expiresAt: z.string().optional(),
});

export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;

// A quote the customer has already acted on (accepted or declined)
// represents a decision they made against specific numbers — editing it
// after the fact without a fresh conversation would be misleading, so
// that's blocked here rather than just discouraged in the UI.
const EDITABLE_STATUSES = ["DRAFT", "SENT", "VIEWED", "EXPIRED"] as const;

export async function updateQuote(input: UpdateQuoteInput) {
  const permission = await requirePermission(PERMISSIONS.QUOTES_MANAGE);
  if (!permission.ok) return { ok: false as const, error: permission.error };

  const parsed = updateQuoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { quoteId, items, fees, discount, tax, depositAmount, termsText, expiresAt } = parsed.data;

  const { subtotal, total, balanceAmount } = computeQuoteTotals(items, {
    fees,
    discount,
    tax,
    depositAmount,
  });

  try {
    const existing = await db.quote.findUnique({ where: { id: quoteId } });
    if (!existing) return { ok: false as const, error: "Quote not found." };
    if (!EDITABLE_STATUSES.includes(existing.status as (typeof EDITABLE_STATUSES)[number])) {
      return {
        ok: false as const,
        error: "This quote has already been accepted or declined and can't be edited.",
      };
    }

    // Editing a lapsed quote is how you re-offer it — bring it back to
    // SENT so the customer's link becomes acceptable again. Any other
    // status (DRAFT/SENT/VIEWED) is left as-is: the same link already
    // shows whatever's currently in the database, so saving changes here
    // *is* the resend — there's no separate copy of the quote to update.
    const nextStatus = existing.status === "EXPIRED" ? "SENT" : existing.status;

    await db.$transaction([
      db.quoteItem.deleteMany({ where: { quoteId } }),
      db.quote.update({
        where: { id: quoteId },
        data: {
          status: nextStatus,
          subtotal,
          fees,
          discount,
          tax,
          total,
          depositAmount: depositAmount ?? null,
          balanceAmount: balanceAmount ?? null,
          termsText: termsText || null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          items: {
            create: items.map((i) => ({
              description: i.description,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              lineTotal: i.quantity * i.unitPrice,
            })),
          },
        },
      }),
    ]);

    revalidatePath(`/admin/quotes/${quoteId}`);
    revalidatePath("/admin/quotes");
    if (existing.leadId) {
      revalidatePath(`/admin/leads/${existing.leadId}`);
    }
    revalidatePath(`/quote/${existing.secureToken}`);
    return { ok: true as const, secureToken: existing.secureToken };
  } catch {
    return { ok: false as const, error: "Could not save changes to this quote." };
  }
}
