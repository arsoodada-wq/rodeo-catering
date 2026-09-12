import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { QuoteBuilder } from "@/components/admin/QuoteBuilder";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { Badge } from "@/components/ui/Badge";
import { PERMISSIONS, hasPageAccess } from "@/lib/permissions";
import { QUOTE_STATUS_TONES } from "@/lib/status";

const LOCKED_STATUSES = new Set(["ACCEPTED", "DECLINED"]);

export default async function AdminQuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await hasPageAccess(PERMISSIONS.QUOTES_MANAGE))) {
    return <AccessRestricted label="quotes" />;
  }

  const { id } = await params;
  const quote = await db.quote.findUnique({
    where: { id },
    include: { items: true, lead: true },
  });
  if (!quote) notFound();

  const locked = LOCKED_STATUSES.has(quote.status);

  return (
    <div>
      <Link
        href="/admin/quotes"
        className="flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to quotes
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
          {quote.quoteNumber}
        </h1>
        <Badge tone={QUOTE_STATUS_TONES[quote.status] ?? "neutral"}>{quote.status}</Badge>
        <Link
          href={`/quote/${quote.secureToken}`}
          target="_blank"
          className="flex items-center gap-1 text-sm font-semibold text-rodeo-600 hover:text-rodeo-700"
        >
          View as customer <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
      {quote.lead && (
        <p className="mt-1 text-sm text-ink-400">
          For{" "}
          <Link href={`/admin/leads/${quote.lead.id}`} className="font-semibold hover:text-rodeo-600">
            {quote.lead.name}
          </Link>
        </p>
      )}

      <div className="mt-6 max-w-2xl">
        {locked ? (
          <div className="rounded-2xl border border-ink-900/8 bg-white p-6">
            <p className="font-semibold text-ink-900">
              This quote can&apos;t be edited.
            </p>
            <p className="mt-2 text-sm text-ink-500">
              The customer already {quote.status === "ACCEPTED" ? "accepted" : "declined"} this
              quote at these exact numbers. If the event details have changed, create a new quote
              from the lead&apos;s detail page instead of changing the record of what they agreed to.
            </p>
          </div>
        ) : (
          <QuoteBuilder
            leadId={quote.leadId ?? ""}
            existingQuote={{
              id: quote.id,
              secureToken: quote.secureToken,
              items: quote.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice),
              })),
              fees: Number(quote.fees),
              discount: Number(quote.discount),
              tax: Number(quote.tax),
              depositAmount: quote.depositAmount !== null ? Number(quote.depositAmount) : null,
              termsText: quote.termsText,
              expiresAt: quote.expiresAt ? quote.expiresAt.toISOString().slice(0, 10) : null,
            }}
          />
        )}
      </div>
    </div>
  );
}
