import { NextResponse } from "next/server";
import { sendFollowUpDigestEmail } from "@/lib/reminders";

/**
 * Fired by a scheduler external to this app (see
 * .github/workflows/follow-up-reminders.yml) — this app has no built-in
 * cron of its own, and correctly so: a serverless/on-demand host would
 * never keep a setInterval alive, and even on a long-running server a
 * scheduler baked into the app can't fire before the app is deployed
 * somewhere with a real, reachable URL. GitHub Actions works identically
 * regardless of what host is eventually chosen for the app itself.
 *
 * Guarded by a shared secret rather than being open — this reads contact
 * details and quote totals and would otherwise let anyone trigger email
 * sends against ADMIN_NOTIFICATION_EMAIL.
 */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

async function handle(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured — see .env.example." },
      { status: 501 }
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { sent, digest } = await sendFollowUpDigestEmail();
    return NextResponse.json({
      ok: true,
      emailSent: sent,
      leadsDue: digest.leads.length,
      quotesExpiring: digest.expiringQuotes.length,
      outreachDue: digest.outreach.length,
    });
  } catch (err) {
    console.error("follow-up-reminders cron failed:", err);
    return NextResponse.json({ ok: false, error: "Failed to build or send the digest." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return handle(request);
}

// GET too — some cron dashboards (and a quick manual browser/curl check)
// only issue GET requests; this endpoint has no side effect beyond sending
// an email, so allowing both verbs is safe.
export async function GET(request: Request) {
  return handle(request);
}
