"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

const CHANGE_LIMIT = 5;
const CHANGE_WINDOW_MS = 15 * 60 * 1000;

const schema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function changeOwnPassword(input: z.infer<typeof schema>) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return { ok: false as const, error: "Not authenticated." };

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Rate-limited per account, same reasoning as login attempts — without
  // this, a stolen/hijacked session cookie combined with no CAPTCHA would
  // let someone brute-force the current password and lock the real owner
  // out permanently by changing it.
  const { allowed } = checkRateLimit(`change-password:${userId}`, CHANGE_LIMIT, CHANGE_WINDOW_MS);
  if (!allowed) {
    return { ok: false as const, error: "Too many attempts — please try again later." };
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash) {
    return { ok: false as const, error: "Account not found." };
  }

  const currentValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!currentValid) {
    return { ok: false as const, error: "Current password is incorrect." };
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await db.user.update({ where: { id: userId }, data: { passwordHash } });
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not update your password." };
  }
}
