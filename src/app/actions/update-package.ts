"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { PERMISSIONS, requirePermission } from "@/lib/permissions";

const numericString = z
  .string()
  .trim()
  .refine((v) => v === "" || !Number.isNaN(Number(v)), "Must be a number");

const schema = z.object({
  id: z.string().min(1),
  basePrice: numericString,
  pricePerPerson: numericString,
  minGuests: numericString,
  maxGuests: numericString,
  active: z.boolean(),
});

export async function updatePackage(input: z.infer<typeof schema>) {
  const permission = await requirePermission(PERMISSIONS.PRICING_MANAGE);
  if (!permission.ok) {
    return { ok: false as const, error: permission.error };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { id, basePrice, pricePerPerson, minGuests, maxGuests, active } = parsed.data;

  try {
    await db.package.update({
      where: { id },
      data: {
        basePrice: basePrice === "" ? null : basePrice,
        pricePerPerson: pricePerPerson === "" ? null : pricePerPerson,
        minGuests: minGuests === "" ? null : Number(minGuests),
        maxGuests: maxGuests === "" ? null : Number(maxGuests),
        active,
      },
    });
    revalidatePath("/admin/packages");
    // /catering is statically rendered, so without this a price/active
    // change here wouldn't reach the public site until the next deploy.
    revalidatePath("/catering");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not save this package." };
  }
}
