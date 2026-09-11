"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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
  const session = await auth();
  if (!session?.user) {
    return { ok: false as const, error: "Not authenticated." };
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
