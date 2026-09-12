import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { QuotePdfDocument } from "@/components/pdf/QuotePdfDocument";

/**
 * Same access model as the public /quote/[token] page: the token itself is
 * the access control (unguessable, crypto.randomBytes-generated — see
 * Quote.secureToken in the schema), so no session/permission check here.
 * Works for both the customer (from the quote page) and an admin (who
 * already has the token on the quote's admin detail page).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  let quote;
  try {
    quote = await db.quote.findUnique({
      where: { secureToken: token },
      include: { items: true, lead: true },
    });
  } catch {
    return NextResponse.json({ error: "Not available." }, { status: 503 });
  }

  if (!quote) {
    return NextResponse.json({ error: "Quote not found." }, { status: 404 });
  }

  const buffer = await renderToBuffer(<QuotePdfDocument quote={quote} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="Quote-${quote.quoteNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
