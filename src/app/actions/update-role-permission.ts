"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const TOGGLEABLE_ROLES = ["MANAGER", "STAFF", "MARKETING"] as const;
type ToggleableRole = (typeof TOGGLEABLE_ROLES)[number];

// Hardcoded SUPER_ADMIN-only check, independent of the permission table this
// action edits — so a mistake here can never lock every admin out of this
// screen the way it could if this were gated by a row in that same table.
export async function toggleRolePermission(role: string, permissionId: string, grant: boolean) {
  const session = await auth();
  const currentRole = (session?.user as { role?: string } | undefined)?.role;
  if (currentRole !== "SUPER_ADMIN") {
    return { ok: false as const, error: "Only a Super Admin can change permissions." };
  }
  if (!TOGGLEABLE_ROLES.includes(role as ToggleableRole)) {
    return { ok: false as const, error: "Invalid role." };
  }

  try {
    if (grant) {
      await db.rolePermission.upsert({
        where: { role_permissionId: { role: role as ToggleableRole, permissionId } },
        create: { role: role as ToggleableRole, permissionId },
        update: {},
      });
    } else {
      await db.rolePermission.deleteMany({ where: { role: role as ToggleableRole, permissionId } });
    }
    revalidatePath("/admin/permissions");
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not update this permission." };
  }
}
