"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { updatePackage } from "@/app/actions/update-package";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  name: string;
  basePrice: string | null;
  pricePerPerson: string | null;
  minGuests: number | null;
  maxGuests: number | null;
  active: boolean;
};

export function PackageRow({
  id,
  name,
  basePrice,
  pricePerPerson,
  minGuests,
  maxGuests,
  active,
}: Props) {
  const [base, setBase] = useState(basePrice ?? "");
  const [perPerson, setPerPerson] = useState(pricePerPerson ?? "");
  const [min, setMin] = useState(minGuests?.toString() ?? "");
  const [max, setMax] = useState(maxGuests?.toString() ?? "");
  const [activeValue, setActiveValue] = useState(active);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updatePackage({
        id,
        basePrice: base,
        pricePerPerson: perPerson,
        minGuests: min,
        maxGuests: max,
        active: activeValue,
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
    <tr className="border-b border-ink-900/8 last:border-0 align-top">
      <td className="p-4">
        <p className="font-semibold text-ink-900">{name}</p>
        {!activeValue && <p className="text-xs text-rodeo-600">Hidden from catering site</p>}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-1.5">
          <span className="text-ink-400">$</span>
          <input
            value={base}
            onChange={(e) => setBase(e.target.value)}
            placeholder="Not set"
            className="w-20 rounded-lg border border-ink-900/15 px-2 py-1.5 text-sm"
          />
          <span className="text-xs text-ink-400">base</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="text-ink-400">$</span>
          <input
            value={perPerson}
            onChange={(e) => setPerPerson(e.target.value)}
            placeholder="Not set"
            className="w-20 rounded-lg border border-ink-900/15 px-2 py-1.5 text-sm"
          />
          <span className="text-xs text-ink-400">/ person</span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-1.5">
          <input
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="Min"
            className="w-16 rounded-lg border border-ink-900/15 px-2 py-1.5 text-sm"
          />
          <span className="text-ink-400">–</span>
          <input
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="Max"
            className="w-16 rounded-lg border border-ink-900/15 px-2 py-1.5 text-sm"
          />
        </div>
      </td>
      <td className="p-4">
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={activeValue}
            onChange={(e) => setActiveValue(e.target.checked)}
          />
          Active
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
