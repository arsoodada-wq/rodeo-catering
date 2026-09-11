"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { toggleRolePermission } from "@/app/actions/update-role-permission";
import { cn } from "@/lib/cn";

type Permission = { id: string; key: string; label: string; description: string | null };
const ROLES = ["MANAGER", "STAFF", "MARKETING"] as const;
type Role = (typeof ROLES)[number];
const ROLE_LABELS: Record<Role, string> = {
  MANAGER: "Manager",
  STAFF: "Staff",
  MARKETING: "Marketing",
};

type Props = {
  permissions: Permission[];
  grants: Record<string, string[]>;
};

export function PermissionsMatrix({ permissions, grants }: Props) {
  const [state, setState] = useState<Record<Role, Set<string>>>(() => ({
    MANAGER: new Set(grants.MANAGER ?? []),
    STAFF: new Set(grants.STAFF ?? []),
    MARKETING: new Set(grants.MARKETING ?? []),
  }));
  const [pendingCell, setPendingCell] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function isGranted(role: Role, permissionId: string) {
    return state[role].has(permissionId);
  }

  function setGrant(role: Role, permissionId: string, granted: boolean) {
    setState((prev) => {
      const updated = new Set(prev[role]);
      if (granted) updated.add(permissionId);
      else updated.delete(permissionId);
      return { ...prev, [role]: updated };
    });
  }

  function toggle(role: Role, permissionId: string) {
    const cellKey = `${role}:${permissionId}`;
    const next = !isGranted(role, permissionId);
    setError(null);
    setPendingCell(cellKey);
    setGrant(role, permissionId, next);

    startTransition(async () => {
      const res = await toggleRolePermission(role, permissionId, next);
      setPendingCell(null);
      if (!res.ok) {
        setError(res.error);
        setGrant(role, permissionId, !next);
      }
    });
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-rodeo-600">{error}</p>}
      <div className="overflow-x-auto rounded-2xl border border-ink-900/8 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-900/8 text-left">
              <th className="p-4 font-semibold text-ink-900">Permission</th>
              {ROLES.map((role) => (
                <th key={role} className="p-4 text-center font-semibold text-ink-900">
                  {ROLE_LABELS[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm) => (
              <tr key={perm.id} className="border-b border-ink-900/8 last:border-0">
                <td className="p-4">
                  <p className="font-medium text-ink-900">{perm.label}</p>
                  {perm.description && <p className="text-xs text-ink-400">{perm.description}</p>}
                </td>
                {ROLES.map((role) => {
                  const cellKey = `${role}:${perm.id}`;
                  const granted = isGranted(role, perm.id);
                  return (
                    <td key={role} className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => toggle(role, perm.id)}
                        disabled={pendingCell === cellKey}
                        aria-label={`${granted ? "Revoke" : "Grant"} ${perm.label} for ${ROLE_LABELS[role]}`}
                        className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors",
                          granted
                            ? "border-rodeo-500 bg-rodeo-500 text-white"
                            : "border-ink-900/15 bg-white hover:border-ink-900/30"
                        )}
                      >
                        {pendingCell === cellKey ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-400" />
                        ) : granted ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : null}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-400">
        Super Admin always has every permission and isn&apos;t shown here — this only controls
        Manager, Staff, and Marketing accounts.
      </p>
    </div>
  );
}
