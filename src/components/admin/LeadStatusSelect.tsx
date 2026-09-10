"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "@/app/actions/update-lead-status";

const STATUS_OPTIONS = [
  "NEW",
  "CONTACTED",
  "QUOTE_SENT",
  "FOLLOW_UP",
  "CONFIRMED",
  "COMPLETED",
  "LOST",
];

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value;
        startTransition(() => {
          void updateLeadStatus(leadId, value);
        });
      }}
      className="rounded-lg border border-ink-900/15 bg-white px-2 py-1 text-xs font-semibold text-ink-700 disabled:opacity-50"
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
