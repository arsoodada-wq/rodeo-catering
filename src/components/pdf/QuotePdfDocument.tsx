import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { business } from "@/lib/site-content";
import { formatEventDate } from "@/lib/format";

/**
 * Server-only — rendered via renderToBuffer() in the /api/quotes/[token]/pdf
 * route, never imported by a client component. @react-pdf/renderer's own
 * components (View/Text/...) are not DOM elements, so this can't be
 * previewed like a normal page — the API route is the only way to see it.
 */

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#1a1a1a", fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  brand: { fontSize: 16, fontWeight: 700 },
  eyebrow: { fontSize: 9, color: "#db594b", fontWeight: 700, marginBottom: 4 },
  businessDetails: { fontSize: 9, color: "#555", lineHeight: 1.5, textAlign: "right" },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  meta: { fontSize: 9, color: "#555", marginBottom: 20 },
  table: { marginTop: 8, borderTop: "1pt solid #ddd" },
  tableRow: { flexDirection: "row", borderBottom: "1pt solid #eee", paddingVertical: 8 },
  tableHeaderRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #ddd",
    paddingVertical: 6,
    fontSize: 8,
    fontWeight: 700,
    color: "#777",
    textTransform: "uppercase",
  },
  colDescription: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colUnitPrice: { flex: 1, textAlign: "right" },
  colLineTotal: { flex: 1, textAlign: "right" },
  totals: { marginTop: 16, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", width: 220, justifyContent: "space-between", marginBottom: 4 },
  totalsLabel: { color: "#555" },
  grandTotalRow: {
    flexDirection: "row",
    width: 220,
    justifyContent: "space-between",
    borderTop: "1pt solid #ddd",
    paddingTop: 6,
    marginTop: 4,
    fontSize: 12,
    fontWeight: 700,
  },
  terms: { marginTop: 28, padding: 12, backgroundColor: "#f7f3ee", fontSize: 9, lineHeight: 1.5 },
  footer: { marginTop: 32, fontSize: 8, color: "#999", textAlign: "center" },
});

function money(value: unknown) {
  return `$${Number(value).toFixed(2)}`;
}

export type QuotePdfData = {
  quoteNumber: string;
  status: string;
  subtotal: unknown;
  fees: unknown;
  discount: unknown;
  tax: unknown;
  total: unknown;
  depositAmount: unknown;
  balanceAmount: unknown;
  termsText: string | null;
  expiresAt: Date | string | null;
  createdAt: Date | string;
  items: { description: string; quantity: number; unitPrice: unknown; lineTotal: unknown }[];
  lead: {
    name: string;
    company: string | null;
    eventType: string;
    guestCount: number;
    eventDate: Date | string | null;
  } | null;
};

export function QuotePdfDocument({ quote }: { quote: QuotePdfData }) {
  return (
    <Document title={`Quote ${quote.quoteNumber} — ${business.cateringBrand}`}>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>CATERING QUOTE</Text>
            <Text style={styles.brand}>{business.cateringBrand}</Text>
          </View>
          <View style={styles.businessDetails}>
            <Text>{business.address.street}</Text>
            <Text>
              {business.address.city}, {business.address.state} {business.address.zip}
            </Text>
            <Text>{business.phone}</Text>
            <Text>{business.email}</Text>
          </View>
        </View>

        <Text style={styles.title}>
          {quote.lead ? `For ${quote.lead.name}` : "Your Catering Quote"}
        </Text>
        <Text style={styles.meta}>
          Quote {quote.quoteNumber} · Issued {formatEventDate(quote.createdAt)}
          {quote.expiresAt ? ` · Valid through ${formatEventDate(quote.expiresAt)}` : ""}
          {quote.lead?.eventDate ? ` · Event date ${formatEventDate(quote.lead.eventDate)}` : ""}
          {quote.lead ? ` · ${quote.lead.guestCount} guests` : ""}
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colUnitPrice}>Unit Price</Text>
            <Text style={styles.colLineTotal}>Total</Text>
          </View>
          {quote.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colUnitPrice}>{money(item.unitPrice)}</Text>
              <Text style={styles.colLineTotal}>{money(item.lineTotal)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text>{money(quote.subtotal)}</Text>
          </View>
          {Number(quote.fees) > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Fees</Text>
              <Text>{money(quote.fees)}</Text>
            </View>
          )}
          {Number(quote.tax) > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Tax</Text>
              <Text>{money(quote.tax)}</Text>
            </View>
          )}
          {Number(quote.discount) > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Discount</Text>
              <Text>-{money(quote.discount)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text>Total</Text>
            <Text>{money(quote.total)}</Text>
          </View>
          {quote.depositAmount != null && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Deposit due</Text>
              <Text>{money(quote.depositAmount)}</Text>
            </View>
          )}
          {quote.balanceAmount != null && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Balance due</Text>
              <Text>{money(quote.balanceAmount)}</Text>
            </View>
          )}
        </View>

        {quote.termsText && (
          <View style={styles.terms}>
            <Text>{quote.termsText}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Questions? Call {business.phone} or email {business.email}.
        </Text>
      </Page>
    </Document>
  );
}
