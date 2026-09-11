"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const ROLES = ["SUPER_ADMIN", "MANAGER", "STAFF", "MARKETING"] as const;

// Hardcoded SUPER_ADMIN-only check, same as /admin/permissions — account
// and role management is sensitive enough to keep out of the toggleable
// permission table entirely.
async function requireSuperAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string; id?: string } | undefined)?.role;
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (role !== "SUPER_ADMIN" || !id) {
    return { ok: false as const, error: "Only a Super Admin can manage user accounts." };
  }
  return { ok: true as const, currentUserId: id };
}

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(ROLES),
});

export async function createUser(input: z.infer<typeof createSchema>) {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return { ok: false as const, error: guard.error };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return { ok: false as const, error: "An account with this email already exists." };
    }
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: parsed.data.role,
        active: true,
      },
    });
    revalidatePath("/admin/users");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not create this account." };
  }
}

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  role: z.enum(ROLES),
  active: z.boolean(),
});

export async function updateUser(input: z.infer<typeof updateSchema>) {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return { ok: false as const, error: guard.error };

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  if (parsed.data.id === guard.currentUserId) {
    if (!parsed.data.active) {
      return { ok: false as const, error: "You can't deactivate your own account." };
    }
    if (parsed.data.role !== "SUPER_ADMIN") {
      return { ok: false as const, error: "You can't remove your own Super Admin role." };
    }
  }

  try {
    await db.user.update({
      where: { id: parsed.data.id },
      data: { name: parsed.data.name, role: parsed.data.role, active: parsed.data.active },
    });
    revalidatePath("/admin/users");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not save this account." };
  }
}

const resetPasswordSchema = z.object({
  id: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function resetUserPassword(input: z.infer<typeof resetPasswordSchema>) {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return { ok: false as const, error: guard.error };

  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await db.user.update({ where: { id: parsed.data.id }, data: { passwordHash } });
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not reset this password." };
  }
}
