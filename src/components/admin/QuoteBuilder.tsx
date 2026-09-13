"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Loader2, Check, Copy, FileDown } from "lucide-react";
import { createQuote } from "@/app/actions/create-quote";
import { updateQuote } from "@/app/actions/update-quote";
import { computeQuoteTotals } from "@/lib/quote-math";

type LineItem = { description: string; quantity: number; unitPrice: number };

type ExistingQuote = {
  id: string;
  secureToken: string;
  items: LineItem[];
  fees: number;
  discount: number;
  tax: number;
  depositAmount: number | null;
  termsText: string | null;
  expiresAt: string | null; // yyyy-mm-dd, for a native date input
};

export function QuoteBuilder({
  leadId,
  defaultItems,
  existingQuote,
}: {
  leadId: string;
  defaultItems?: LineItem[];
  existingQuote?: ExistingQuote;
}) {
  const isEditing = Boolean(existingQuote);

  const [items, setItems] = useState<LineItem[]>(
    existingQuote && existingQuote.items.length > 0
      ? existingQuote.items
      : defaultItems && defaultItems.length > 0
        ? defaultItems
        : [{ description: "", quantity: 1, unitPrice: 0 }]
  );
  const [fees, setFees] = useState(existingQuote?.fees ?? 0);
  const [discount, setDiscount] = useState(existingQuote?.discount ?? 0);
  const [tax, setTax] = useState(existingQuote?.tax ?? 0);
  const [depositAmount, setDepositAmount] = useState<number | "">(
    existingQuote?.depositAmount ?? ""
  );
  const [termsText, setTermsText] = useState(existingQuote?.termsText ?? "");
  const [expiresAt, setExpiresAt] = useState(existingQuote?.expiresAt ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [created, setCreated] = useState<{ secureToken: string } | null>(null);
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
    setSaved(false);
    const cleanItems = items.filter((i) => i.description.trim() !== "");
    startTransition(async () => {
      const res = existingQuote
        ? await updateQuote({
            quoteId: existingQuote.id,
            items: cleanItems,
            fees,
            discount,
            tax,
            depositAmount: depositAmount === "" ? undefined : depositAmount,
            termsText: termsText || undefined,
            expiresAt: expiresAt || undefined,
          })
        : await createQuote({
            leadId,
            items: cleanItems,
            fees,
            discount,
            tax,
            depositAmount: depositAmount === "" ? undefined : depositAmount,
            termsText: termsText || undefined,
            expiresAt: expiresAt || undefined,
          });

      if (res.ok) {
        if (isEditing) {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        } else {
          setCreated({ secureToken: res.secureToken });
        }
      } else {
        setError(res.error);
      }
    });
  }

  const linkToken = existingQuote?.secureToken ?? created?.secureToken;

  function copyLink(token: string) {
    const quoteUrl =
      typeof window !== "undefined" ? `${window.location.origin}/quote/${token}` : `/quote/${token}`;
    navigator.clipboard.writeText(quoteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Create flow: once it's created, replace the form with a simple
  // confirmation + link — nothing left to do on this screen. Edit flow
  // never reaches this: it shows the form and the link together instead,
  // since there's usually more than one round of edits.
  if (created && !isEditing) {
    return (
      <div className="rounded-2xl border border-rodeo-200 bg-rodeo-50 p-6">
        <div className="flex items-center gap-2 text-rodeo-700">
          <Check className="h-5 w-5" />
          <h3 className="font-bold">Quote created</h3>
        </div>
        <p className="mt-2 text-sm text-ink-600">
          Send this link to the customer — it&apos;s the only way to view this quote.
        </p>
        <div className="mt-3">
          <LinkBox token={created.secureToken} copied={copied} onCopy={copyLink} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-900/8 bg-white p-6">
      <h3 className="font-bold text-ink-900">{isEditing ? "Edit This Quote" : "Create a Quote"}</h3>

      {isEditing && linkToken && (
        <div className="mt-3 rounded-xl bg-cream-100 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Customer link — saving changes updates this same link
          </p>
          <LinkBox token={linkToken} copied={copied} onCopy={copyLink} />
        </div>
      )}

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
                aria-label="Description"
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
                aria-label="Qty"
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
                aria-label="Unit Price"
                className="input mt-1"
              />
            </div>
            <button
              onClick={() => removeItem(i)}
              disabled={items.length === 1}
              aria-label="Remove line item"
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
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : null}
          {isEditing ? (saved ? "Saved" : "Save Changes") : "Create & Get Link"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-rodeo-600">{error}</p>}
    </div>
  );
}

function LinkBox({
  token,
  copied,
  onCopy,
}: {
  token: string;
  copied: boolean;
  onCopy: (token: string) => void;
}) {
  const quoteUrl =
    typeof window !== "undefined" ? `${window.location.origin}/quote/${token}` : `/quote/${token}`;
  return (
    <div className="flex items-center gap-2">
      <input readOnly value={quoteUrl} className="input flex-1 bg-white" />
      <button
        onClick={() => onCopy(token)}
        className="flex items-center gap-1.5 rounded-full bg-rodeo-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rodeo-600"
      >
        <Copy className="h-3.5 w-3.5" />
        {copied ? "Copied" : "Copy"}
      </button>
      <a
        href={`/api/quotes/${token}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-full border border-ink-900/15 px-4 py-2 text-xs font-semibold text-ink-700 hover:border-ink-900/40"
      >
        <FileDown className="h-3.5 w-3.5" />
        PDF
      </a>
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
