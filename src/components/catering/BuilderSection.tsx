"use client";

import { useState } from "react";
import { Sparkles, ListChecks } from "lucide-react";
import { cn } from "@/lib/cn";
import { CateringWizard } from "@/components/catering/CateringWizard";
import { ConciergeChat } from "@/components/catering/ConciergeChat";

export function BuilderSection({
  confirmedServiceAreas,
  aiConciergeEnabled,
}: {
  confirmedServiceAreas: string[];
  aiConciergeEnabled: boolean;
}) {
  const [tab, setTab] = useState<"wizard" | "concierge">(
    aiConciergeEnabled ? "concierge" : "wizard"
  );

  if (!aiConciergeEnabled) {
    return <CateringWizard confirmedServiceAreas={confirmedServiceAreas} />;
  }

  return (
    <div>
      <div className="mb-6 inline-flex rounded-full border border-ink-900/10 bg-white p-1">
        <button
          onClick={() => setTab("concierge")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            tab === "concierge" ? "bg-rodeo-500 text-white" : "text-ink-500 hover:text-ink-900"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" /> Chat with Us
        </button>
        <button
          onClick={() => setTab("wizard")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
            tab === "wizard" ? "bg-rodeo-500 text-white" : "text-ink-500 hover:text-ink-900"
          )}
        >
          <ListChecks className="h-3.5 w-3.5" /> Guided Builder
        </button>
      </div>

      {tab === "concierge" ? (
        <ConciergeChat />
      ) : (
        <CateringWizard confirmedServiceAreas={confirmedServiceAreas} />
      )}
    </div>
  );
}
