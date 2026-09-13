import { describe, expect, it, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

let sessionUserId: string | undefined = "user-1";
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => (sessionUserId ? { user: { id: sessionUserId } } : null)),
}));

const findUnique = vi.fn();
const update = vi.fn();
vi.mock("@/lib/db", () => ({
  db: { user: { findUnique: (...args: unknown[]) => findUnique(...args), update: (...args: unknown[]) => update(...args) } },
}));

vi.mock("@/lib/rate-limit", async () => {
  const actual = await vi.importActual<typeof import("@/lib/rate-limit")>("@/lib/rate-limit");
  return actual;
});

import { changeOwnPassword } from "./change-own-password";
import { _resetRateLimitsForTests } from "@/lib/rate-limit";

describe("changeOwnPassword", () => {
  beforeEach(async () => {
    sessionUserId = "user-1";
    findUnique.mockReset();
    update.mockReset();
    update.mockResolvedValue({ id: "user-1" });
    _resetRateLimitsForTests();
    findUnique.mockResolvedValue({ id: "user-1", passwordHash: await bcrypt.hash("correct-password", 12) });
  });

  it("rejects when there's no signed-in session", async () => {
    sessionUserId = undefined;
    const res = await changeOwnPassword({ currentPassword: "x", newPassword: "newpassword123" });
    expect(res.ok).toBe(false);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("rejects when the current password is wrong, without touching the stored hash", async () => {
    const res = await changeOwnPassword({ currentPassword: "wrong-password", newPassword: "newpassword123" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/incorrect/i);
    expect(update).not.toHaveBeenCalled();
  });

  it("updates the password hash when the current password is correct", async () => {
    const res = await changeOwnPassword({
      currentPassword: "correct-password",
      newPassword: "newpassword123",
    });
    expect(res.ok).toBe(true);
    expect(update).toHaveBeenCalledTimes(1);

    const newHash = update.mock.calls[0][0].data.passwordHash as string;
    expect(await bcrypt.compare("newpassword123", newHash)).toBe(true);
  });

  it("rate-limits repeated attempts on the same account", async () => {
    for (let i = 0; i < 5; i++) {
      await changeOwnPassword({ currentPassword: "wrong-password", newPassword: "newpassword123" });
    }
    const sixth = await changeOwnPassword({ currentPassword: "correct-password", newPassword: "newpassword123" });
    expect(sixth.ok).toBe(false);
    if (!sixth.ok) expect(sixth.error).toMatch(/too many attempts/i);
  });
});
