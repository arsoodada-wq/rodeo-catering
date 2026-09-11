import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    rolePermission: {
      findFirst: vi.fn(),
    },
  },
}));

// permissions.ts also imports @/lib/auth for the session-reading helpers
// (unused by roleHasPermission itself), which pulls in next-auth's real
// module graph — including "next/server", which isn't resolvable outside
// of Next's own build pipeline. Stub it out rather than dragging that in.
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

import { db } from "@/lib/db";
import { roleHasPermission, PERMISSIONS } from "./permissions";

describe("roleHasPermission", () => {
  it("always grants SUPER_ADMIN, without even checking the database", async () => {
    // This is the guard that keeps /admin/permissions from ever being able
    // to lock every admin out — Super Admin's access can't depend on a row
    // in the very table that screen edits.
    const allowed = await roleHasPermission("SUPER_ADMIN", PERMISSIONS.CONTENT_MANAGE);
    expect(allowed).toBe(true);
    expect(db.rolePermission.findFirst).not.toHaveBeenCalled();
  });

  it("grants a non-super-admin role only when a matching row exists", async () => {
    vi.mocked(db.rolePermission.findFirst).mockResolvedValueOnce({ id: "row-1" } as never);
    const allowed = await roleHasPermission("MANAGER", PERMISSIONS.PRICING_MANAGE);
    expect(allowed).toBe(true);
  });

  it("denies a non-super-admin role when no matching row exists", async () => {
    vi.mocked(db.rolePermission.findFirst).mockResolvedValueOnce(null);
    const denied = await roleHasPermission("STAFF", PERMISSIONS.SERVICE_AREAS_MANAGE);
    expect(denied).toBe(false);
  });
});
