"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const updateSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  active: z.boolean(),
});

function revalidatePublicPages() {
  revalidatePath("/");
  revalidatePath("/catering");
  revalidatePath("/admin/faqs");
}

export async function updateFaq(input: z.infer<typeof updateSchema>) {
  const session = await auth();
  if (!session?.user) {
    return { ok: false as const, error: "Not authenticated." };
  }

  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await db.fAQ.update({
      where: { id: parsed.data.id },
      data: {
        question: parsed.data.question,
        answer: parsed.data.answer,
        active: parsed.data.active,
      },
    });
    revalidatePublicPages();
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not save this FAQ." };
  }
}

const createSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

export async function createFaq(input: z.infer<typeof createSchema>) {
  const session = await auth();
  if (!session?.user) {
    return { ok: false as const, error: "Not authenticated." };
  }

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    const count = await db.fAQ.count();
    await db.fAQ.create({
      data: {
        question: parsed.data.question,
        answer: parsed.data.answer,
        pages: ["catering"],
        sortOrder: count,
        active: true,
      },
    });
    revalidatePublicPages();
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not create this FAQ." };
  }
}

const deleteSchema = z.object({ id: z.string().min(1) });

export async function deleteFaq(input: z.infer<typeof deleteSchema>) {
  const session = await auth();
  if (!session?.user) {
    return { ok: false as const, error: "Not authenticated." };
  }

  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid request." };
  }

  try {
    await db.fAQ.delete({ where: { id: parsed.data.id } });
    revalidatePublicPages();
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Could not delete this FAQ." };
  }
}
