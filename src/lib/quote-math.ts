export type QuoteLineItem = {
  quantity: number;
  unitPrice: number;
};

export type QuoteTotals = {
  subtotal: number;
  total: number;
  balanceAmount: number | undefined;
};

/**
 * The single source of truth for a quote's dollar math — shared by the
 * server action that creates the quote and the admin form that previews it
 * live, so the number an admin sees while building a quote can never drift
 * from the number that actually gets saved.
 */
export function computeQuoteTotals(
  items: QuoteLineItem[],
  { fees = 0, discount = 0, tax = 0, depositAmount }: { fees?: number; discount?: number; tax?: number; depositAmount?: number } = {}
): QuoteTotals {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const total = Math.max(0, subtotal + fees + tax - discount);
  const balanceAmount = depositAmount !== undefined ? total - depositAmount : undefined;
  return { subtotal, total, balanceAmount };
}
