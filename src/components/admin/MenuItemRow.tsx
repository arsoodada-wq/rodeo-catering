"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateMenuItem } from "@/app/actions/update-menu-item";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  name: string;
  price: string | null;
  pricingType: "FLAT" | "PER_PERSON";
  available: boolean;
};

export function MenuItemRow({ id, name, price, pricingType, available }: Props) {
  const [priceValue, setPriceValue] = useState(price ?? "");
  const [pricingTypeValue, setPricingTypeValue] = useState(pricingType);
  const [availableValue, setAvailableValue] = useState(available);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateMenuItem({
        id,
        price: priceValue,
        pricingType: pricingTypeValue,
        available: availableValue,
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <tr className="border-b border-ink-900/8 last:border-0">
      <td className="p-4">
        <p className="font-semibold text-ink-900">{name}</p>
        {!available && <p className="text-xs text-rodeo-600">Hidden from catering site</p>}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-1.5">
          <span className="text-ink-400">$</span>
          <input
            value={priceValue}
            onChange={(e) => setPriceValue(e.target.value)}
            placeholder="Not set"
            className="w-24 rounded-lg border border-ink-900/15 px-2 py-1.5 text-sm"
          />
        </div>
      </td>
      <td className="p-4">
        <select
          value={pricingTypeValue}
          onChange={(e) => setPricingTypeValue(e.target.value as "FLAT" | "PER_PERSON")}
          className="rounded-lg border border-ink-900/15 bg-white px-2 py-1.5 text-sm"
        >
          <option value="PER_PERSON">Per Person</option>
          <option value="FLAT">Flat</option>
        </select>
      </td>
      <td className="p-4">
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={availableValue}
            onChange={(e) => setAvailableValue(e.target.checked)}
          />
          Available
        </label>
      </td>
      <td className="p-4">
        <button
          onClick={save}
          disabled={pending}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            saved ? "bg-green-100 text-green-700" : "bg-rodeo-500 text-white hover:bg-rodeo-600",
            pending && "opacity-60"
          )}
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : saved ? (
            <Check className="h-3.5 w-3.5" />
          ) : null}
          {saved ? "Saved" : "Save"}
        </button>
        {error && <p className="mt-1 text-xs text-rodeo-600">{error}</p>}
      </td>
    </tr>
  );
}
