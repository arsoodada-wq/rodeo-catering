"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Loader2, Check, Copy } from "lucide-react";
import { createQuote } from "@/app/actions/create-quote";
import { computeQuoteTotals } from "@/lib/quote-math";

type LineItem = { description: string; quantity: number; unitPrice: number };

export function QuoteBuilder({
  leadId,
  defaultItems,
}: {
  leadId: string;
  defaultItems?: LineItem[];
}) {
  const [items, setItems] = useState<LineItem[]>(
    defaultItems && defaultItems.length > 0
      ? defaultItems
      : [{ description: "", quantity: 1, unitPrice: 0 }]
  );
  const [fees, setFees] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [depositAmount, setDepositAmount] = useState<number | "">("");
  const [termsText, setTermsText] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ secureToken: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const { subtotal, total } = computeQuoteTotals(items, { fees, discount, tax });

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createQuote({
        leadId,
        items: items.filter((i) => i.description.trim() !== ""),
        fees,
        discount,
        tax,
        depositAmount: depositAmount === "" ? undefined : depositAmount,
        termsText: termsText || undefined,
        expiresAt: expiresAt || undefined,
      });
      if (res.ok) {
        setResult({ secureToken: res.secureToken });
      } else {
        setError(res.error);
      }
    });
  }

  if (result) {
    const quoteUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/quote/${result.secureToken}`
        : `/quote/${result.secureToken}`;
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <Check className="h-5 w-5" />
          <h3 className="font-bold">Quote created</h3>
        </div>
        <p className="mt-2 text-sm text-ink-600">
          Send this link to the customer — it&apos;s the only way to view this quote.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <input readOnly value={quoteUrl} className="input flex-1 bg-white" />
          <button
            onClick={() => {
              navigator.clipboard.writeText(quoteUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1.5 rounded-full bg-rodeo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rodeo-600"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-900/8 bg-white p-6">
      <h3 className="font-bold text-ink-900">Create a Quote</h3>

      <div className="mt-4 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_80px_100px_auto] items-end gap-2">
            <div>
              {i === 0 && (
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Description
                </label>
              )}
              <input
                value={item.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                placeholder="e.g. Smash Burger Package"
                className="input mt-1"
              />
            </div>
            <div>
              {i === 0 && (
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Qty
                </label>
              )}
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItem(i, { quantity: Number(e.target.value) || 1 })}
                className="input mt-1"
              />
            </div>
            <div>
              {i === 0 && (
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Unit Price
                </label>
              )}
              <input
                type="number"
                min={0}
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => updateItem(i, { unitPrice: Number(e.target.value) || 0 })}
                className="input mt-1"
              />
            </div>
            <button
              onClick={() => removeItem(i)}
              disabled={items.length === 1}
              className="mb-0.5 flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 hover:text-rodeo-600 disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 text-xs font-semibold text-rodeo-600 hover:text-rodeo-700"
        >
          <Plus className="h-3.5 w-3.5" /> Add line item
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Field label="Fees ($)">
          <input
            type="number"
            min={0}
            step="0.01"
            value={fees}
            onChange={(e) => setFees(Number(e.target.value) || 0)}
            className="input"
          />
        </Field>
        <Field label="Discount ($)">
          <input
            type="number"
            min={0}
            step="0.01"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value) || 0)}
            className="input"
          />
        </Field>
        <Field label="Tax ($)">
          <input
            type="number"
            min={0}
            step="0.01"
            value={tax}
            onChange={(e) => setTax(Number(e.target.value) || 0)}
            className="input"
          />
        </Field>
        <Field label="Deposit ($, optional)">
          <input
            type="number"
            min={0}
            step="0.01"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value === "" ? "" : Number(e.target.value))}
            className="input"
          />
        </Field>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Expires on (optional)">
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Terms (optional)">
          <input
            value={termsText}
            onChange={(e) => setTermsText(e.target.value)}
            placeholder="e.g. 50% deposit due at booking"
            className="input"
          />
        </Field>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-ink-900/8 pt-4">
        <div className="text-sm text-ink-600">
          Subtotal ${subtotal.toFixed(2)} · <span className="font-bold text-ink-900">Total ${total.toFixed(2)}</span>
        </div>
        <button
          onClick={submit}
          disabled={pending || items.every((i) => !i.description.trim())}
          className="flex items-center gap-1.5 rounded-full bg-rodeo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rodeo-600 disabled:opacity-50"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Create & Get Link
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-rodeo-600">{error}</p>}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
