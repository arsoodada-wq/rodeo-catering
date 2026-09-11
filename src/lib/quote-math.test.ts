import { describe, expect, it } from "vitest";
import { computeQuoteTotals } from "./quote-math";

describe("computeQuoteTotals", () => {
  it("sums quantity * unitPrice across line items", () => {
    const { subtotal } = computeQuoteTotals([
      { quantity: 2, unitPrice: 10 },
      { quantity: 1, unitPrice: 5 },
    ]);
    expect(subtotal).toBe(25);
  });

  it("adds fees and tax, then subtracts discount", () => {
    const { total } = computeQuoteTotals([{ quantity: 1, unitPrice: 100 }], {
      fees: 20,
      tax: 8,
      discount: 15,
    });
    expect(total).toBe(113);
  });

  it("never lets the total go negative, even with a discount larger than the subtotal", () => {
    const { total } = computeQuoteTotals([{ quantity: 1, unitPrice: 10 }], { discount: 1000 });
    expect(total).toBe(0);
  });

  it("defaults fees/discount/tax to zero when omitted", () => {
    const { subtotal, total } = computeQuoteTotals([{ quantity: 3, unitPrice: 4 }]);
    expect(subtotal).toBe(12);
    expect(total).toBe(12);
  });

  it("leaves balanceAmount undefined when no deposit is given", () => {
    const { balanceAmount } = computeQuoteTotals([{ quantity: 1, unitPrice: 50 }]);
    expect(balanceAmount).toBeUndefined();
  });

  it("computes balanceAmount as total minus the deposit", () => {
    const { balanceAmount } = computeQuoteTotals([{ quantity: 1, unitPrice: 200 }], {
      depositAmount: 50,
    });
    expect(balanceAmount).toBe(150);
  });

  it("returns a subtotal of zero for no line items", () => {
    const { subtotal, total } = computeQuoteTotals([]);
    expect(subtotal).toBe(0);
    expect(total).toBe(0);
  });
});
