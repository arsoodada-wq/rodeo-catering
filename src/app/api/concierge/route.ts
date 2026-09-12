import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";
import { runConciergeTurn } from "@/lib/ai/concierge";

const CONCIERGE_LIMIT = 30;
const CONCIERGE_WINDOW_MS = 60 * 60 * 1000;
const MAX_MESSAGES = 40;
const MAX_MESSAGE_LENGTH = 2000;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
      })
    )
    .min(1)
    .max(MAX_MESSAGES),
});

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ ok: false, notConfigured: true }, { status: 200 });
  }

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || hdrs.get("x-real-ip") || "unknown";
  const { allowed } = checkRateLimit(`concierge:${ip}`, CONCIERGE_LIMIT, CONCIERGE_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many messages — please try again in a bit, or call us directly." },
      { status: 429 }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  try {
    const result = await runConciergeTurn(parsed.data.messages);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Concierge turn failed:", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong — please try again or call us directly." },
      { status: 500 }
    );
  }
}
