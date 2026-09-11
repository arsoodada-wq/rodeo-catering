"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  id: z.string().min(1),
  price: z
    .string()
    .trim()
    .refine((v) => v === "" || !Number.isNaN(Number(v)), "Price must be a number"),
  pricingType: z.enum(["FLAT", "PER_PERSON"]),
  available: z.boolean(),
});

export async function updateMenuItem(input: z.infer<typeof schema>) {
  const session = await auth();
  if (!session?.user) {
    return { ok: false as const, error: "Not authenticated." };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { id, price, pricingType, available } = parsed.data;

  try {
    await db.menuItem.update({
      where: { id },
      data: {
        price: price === "" ? null : price,
        pricingType,
        available,
      },
    });
    revalidatePath("/admin/menu");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not save this item." };
  }
}
