import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { business } from "@/lib/site-content";
import { db } from "@/lib/db";
import { AcceptQuoteButton } from "@/components/catering/AcceptQuoteButton";

export const metadata: Metadata = {
  title: "Your Catering Quote",
  robots: { index: false, follow: false },
};

export default async function QuotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const quote = await db.quote.findUnique({
    where: { secureToken: token },
    include: { items: true, lead: true },
  });

  if (!quote) notFound();

  // Mark as viewed the first time the customer opens it — best-effort,
  // never blocks rendering if it fails.
  if (quote.status === "SENT") {
    try {
      await db.quote.update({
        where: { id: quote.id },
        data: { status: "VIEWED", viewedAt: new Date() },
      });
    } catch {
      // non-critical
    }
  }

  const isExpired = quote.expiresAt ? new Date(quote.expiresAt) < new Date() : false;
  const canAccept = !isExpired && quote.status !== "ACCEPTED" && quote.status !== "DECLINED";

  return (
    <Container className="max-w-3xl py-16 md:py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">
        Catering Quote {quote.quoteNumber}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
        {quote.lead ? `For ${quote.lead.name}` : "Your Catering Quote"}
      </h1>
      {quote.expiresAt && (
        <p className="mt-2 text-sm text-ink-400">
          {isExpired ? "This quote expired on " : "Valid through "}
          {new Date(quote.expiresAt).toLocaleDateString()}
        </p>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl border border-ink-900/8 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-900/8 text-xs font-semibold uppercase tracking-wide text-ink-400">
            <tr>
              <th className="p-4">Description</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Unit Price</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/8">
            {quote.items.map((item) => (
              <tr key={item.id}>
                <td className="p-4 text-ink-900">{item.description}</td>
                <td className="p-4 text-ink-600">{item.quantity}</td>
                <td className="p-4 text-ink-600">${item.unitPrice.toString()}</td>
                <td className="p-4 text-right font-medium text-ink-900">
                  ${item.lineTotal.toString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-1.5 border-t border-ink-900/8 p-5 text-sm">
          <div className="flex justify-between text-ink-600">
            <span>Subtotal</span>
            <span>${quote.subtotal.toString()}</span>
          </div>
          {Number(quote.fees) > 0 && (
            <div className="flex justify-between text-ink-600">
              <span>Fees</span>
              <span>${quote.fees.toString()}</span>
            </div>
          )}
          {Number(quote.tax) > 0 && (
            <div className="flex justify-between text-ink-600">
              <span>Tax</span>
              <span>${quote.tax.toString()}</span>
            </div>
          )}
          {Number(quote.discount) > 0 && (
            <div className="flex justify-between text-ink-600">
              <span>Discount</span>
              <span>-${quote.discount.toString()}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-ink-900/8 pt-1.5 text-base font-bold text-ink-900">
            <span>Total</span>
            <span>${quote.total.toString()}</span>
          </div>
          {quote.depositAmount && (
            <div className="flex justify-between text-ink-400">
              <span>Deposit due</span>
              <span>${quote.depositAmount.toString()}</span>
            </div>
          )}
        </div>
      </div>

      {quote.termsText && (
        <p className="mt-6 rounded-xl bg-cream-100 p-4 text-sm text-ink-600">{quote.termsText}</p>
      )}

      <div className="mt-8">
        {quote.status === "ACCEPTED" ? (
          <p className="text-sm font-semibold text-green-700">
            This quote was accepted{quote.acceptedAt ? ` on ${new Date(quote.acceptedAt).toLocaleDateString()}` : ""}.
          </p>
        ) : isExpired ? (
          <p className="text-sm font-semibold text-rodeo-600">
            This quote has expired. Call us at {business.phone} for an updated quote.
          </p>
        ) : canAccept ? (
          <AcceptQuoteButton token={token} />
        ) : null}
      </div>

      <p className="mt-8 text-sm text-ink-400">
        Questions? Call us at{" "}
        <a href={business.phoneHref} className="font-semibold text-rodeo-600">
          {business.phone}
        </a>{" "}
        or email{" "}
        <a href={`mailto:${business.email}`} className="font-semibold text-rodeo-600">
          {business.email}
        </a>
        .
      </p>
    </Container>
  );
}
