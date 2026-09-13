"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, CalendarClock } from "lucide-react";
import { updateLeadFollowUp } from "@/app/actions/update-lead-followup";
import { cn } from "@/lib/cn";

function toDateInputValue(date: Date | string | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function LeadFollowUpDate({ leadId, followUpDate }: { leadId: string; followUpDate: Date | string | null }) {
  const [value, setValue] = useState(toDateInputValue(followUpDate));
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save(next: string) {
    setValue(next);
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateLeadFollowUp({ leadId, followUpDate: next });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-ink-900/8 bg-white p-5">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-ink-400">
        <CalendarClock className="h-4 w-4" /> Follow-Up Reminder
      </h2>
      <p className="mt-1 text-xs text-ink-400">
        Set a date and this lead is included in the daily follow-up email until its status is
        Completed or Lost.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="date"
          value={value}
          onChange={(e) => save(e.target.value)}
          disabled={pending}
          className="input flex-1"
        />
        {pending && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink-400" />}
        {!pending && saved && <Check className="h-4 w-4 shrink-0 text-green-600" />}
      </div>
      {error && <p className={cn("mt-2 text-xs text-rodeo-600")}>{error}</p>}
    </div>
  );
}
