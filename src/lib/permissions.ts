import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Permission keys, backed by the Permission/RolePermission tables in the
 * schema. SUPER_ADMIN always passes every check (hardcoded, not stored) so
 * editing role_permissions can never lock every admin out of the dashboard.
 * Default role assignments (seeded in prisma/seed.ts) are a reasonable
 * technical default, not a business-confirmed policy — an admin can change
 * who has what at /admin/permissions (SUPER_ADMIN only) without a code change.
 */
export const PERMISSIONS = {
  LEADS_MANAGE: "leads.manage",
  QUOTES_MANAGE: "quotes.manage",
  PRICING_MANAGE: "pricing.manage",
  SERVICE_AREAS_MANAGE: "service_areas.manage",
  CONTENT_MANAGE: "content.manage",
  MARKETING_MANAGE: "marketing.manage",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export async function roleHasPermission(role: string, key: PermissionKey): Promise<boolean> {
  if (role === "SUPER_ADMIN") return true;
  const match = await db.rolePermission.findFirst({
    where: { role: role as never, permission: { key } },
  });
  return Boolean(match);
}

type PermissionResult = { ok: true } | { ok: false; error: string };

export async function currentUserRole(): Promise<string | null> {
  const session = await auth();
  return (session?.user as { role?: string } | undefined)?.role ?? null;
}

/** For gating a whole admin page (as opposed to a single mutation). */
export async function hasPageAccess(key: PermissionKey): Promise<boolean> {
  const role = await currentUserRole();
  if (!role) return false;
  return roleHasPermission(role, key);
}

export async function requirePermission(key: PermissionKey): Promise<PermissionResult> {
  const role = await currentUserRole();
  if (!role) {
    return { ok: false, error: "Not authenticated." };
  }
  const allowed = await roleHasPermission(role, key);
  if (!allowed) {
    return { ok: false, error: "You don't have permission to do this." };
  }
  return { ok: true };
}
