import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * For an uptime monitor or hosting platform's health check, not for humans
 * (there's no page linking to this). Checks the one dependency that
 * actually matters for the site to function: the database. Doesn't check
 * optional integrations (Resend, Anthropic) since this app already fails
 * safe without them — a missing ANTHROPIC_API_KEY just hides the AI
 * concierge tab, it doesn't mean the site is down.
 */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch {
    return NextResponse.json({ status: "error", database: "unreachable" }, { status: 503 });
  }
}
