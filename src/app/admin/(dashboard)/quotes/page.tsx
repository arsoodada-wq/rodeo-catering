import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PERMISSIONS, hasPageAccess } from "@/lib/permissions";
import { Badge } from "@/components/ui/Badge";
import { QUOTE_STATUS_TONES } from "@/lib/status";

async function getQuotes() {
  try {
    const quotes = await db.quote.findMany({
      orderBy: { createdAt: "desc" },
      include: { lead: true },
    });
    return { ok: true as const, quotes };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminQuotesPage() {
  if (!(await hasPageAccess(PERMISSIONS.QUOTES_MANAGE))) {
    return <AccessRestricted label="quotes" />;
  }

  const data = await getQuotes();

  if (!data.ok) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-bold">Database not connected</h1>
        </div>
        <p className="mt-2 text-sm text-rodeo-700/80">
          Set <code className="rounded bg-white/60 px-1 py-0.5">DATABASE_URL</code> to see quotes here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Quotes</h1>
      <p className="mt-1 text-sm text-ink-400">
        Created from a lead&apos;s detail page. Click a quote number to view it as the customer would.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-900/8 bg-white">
        {data.quotes.length === 0 ? (
          <p className="p-6 text-sm text-ink-400">
            No quotes yet — open a lead and use &quot;Create a Quote&quot; to send your first one.
          </p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-ink-900/8 text-xs font-semibold uppercase tracking-wide text-ink-400">
              <tr>
                <th className="p-4">Quote</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/8">
              {data.quotes.map((quote) => (
                <tr key={quote.id}>
                  <td className="p-4">
                    <Link
                      href={`/quote/${quote.secureToken}`}
                      target="_blank"
                      className="font-semibold text-rodeo-600 hover:text-rodeo-700"
                    >
                      {quote.quoteNumber}
                    </Link>
                  </td>
                  <td className="p-4 text-ink-600">
                    {quote.lead ? (
                      <Link href={`/admin/leads/${quote.lead.id}`} className="hover:text-rodeo-600">
                        {quote.lead.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-4 text-ink-600">${quote.total.toString()}</td>
                  <td className="p-4">
                    <Badge tone={QUOTE_STATUS_TONES[quote.status] ?? "neutral"}>{quote.status}</Badge>
                  </td>
                  <td className="p-4 text-ink-400">
                    {quote.sentAt ? new Date(quote.sentAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
