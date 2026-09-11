"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

// Deliberately no auth() check: the customer accepting their own quote is
// not logged in. The unguessable secureToken is the access control here —
// same trust model as a password-reset link.
export async function acceptQuote(token: string) {
  if (!token) return { ok: false as const, error: "Invalid quote link." };

  try {
    const quote = await db.quote.findUnique({ where: { secureToken: token } });
    if (!quote) return { ok: false as const, error: "Quote not found." };
    if (quote.status === "ACCEPTED") return { ok: true as const };
    if (quote.status === "EXPIRED" || quote.status === "DECLINED") {
      return { ok: false as const, error: "This quote is no longer available to accept." };
    }

    await db.quote.update({
      where: { secureToken: token },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });

    if (quote.leadId) {
      await db.lead.update({ where: { id: quote.leadId }, data: { status: "CONFIRMED" } });
    }

    revalidatePath(`/quote/${token}`);
    revalidatePath("/admin/quotes");
    revalidatePath("/admin/leads");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not accept this quote. Please contact us directly." };
  }
}
