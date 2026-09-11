import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { PermissionsMatrix } from "@/components/admin/PermissionsMatrix";

const ROLES = ["MANAGER", "STAFF", "MARKETING"] as const;

async function getData() {
  try {
    const [permissions, rolePermissions] = await Promise.all([
      db.permission.findMany({ orderBy: { key: "asc" } }),
      db.rolePermission.findMany(),
    ]);
    return { ok: true as const, permissions, rolePermissions };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminPermissionsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (role !== "SUPER_ADMIN") {
    return (
      <div className="rounded-2xl border border-ink-900/10 bg-cream-100 p-6">
        <h1 className="text-lg font-bold text-ink-900">Access restricted</h1>
        <p className="mt-2 text-sm text-ink-500">Only a Super Admin can manage role permissions.</p>
      </div>
    );
  }

  const data = await getData();
  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to manage permissions here.
        </p>
      </div>
    );
  }

  const grants: Record<string, string[]> = { MANAGER: [], STAFF: [], MARKETING: [] };
  for (const rp of data.rolePermissions) {
    if ((ROLES as readonly string[]).includes(rp.role)) {
      grants[rp.role].push(rp.permissionId);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Permissions</h1>
      <p className="mt-1 text-sm text-ink-400">
        Control what Manager, Staff, and Marketing accounts can do. Changes apply immediately —
        no code change or redeploy needed. These defaults were set by the developer as a
        reasonable starting point; adjust them to match how the business actually wants to
        split responsibilities.
      </p>

      <div className="mt-6">
        <PermissionsMatrix
          permissions={data.permissions.map((p) => ({
            id: p.id,
            key: p.key,
            label: p.label,
            description: p.description,
          }))}
          grants={grants}
        />
      </div>
    </div>
  );
}
