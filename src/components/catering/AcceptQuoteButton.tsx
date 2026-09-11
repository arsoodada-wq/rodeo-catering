"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { acceptQuote } from "@/app/actions/accept-quote";
import { Button } from "@/components/ui/Button";

export function AcceptQuoteButton({ token }: { token: string }) {
  const [pending, startTransition] = useTransition();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function accept() {
    setError(null);
    startTransition(async () => {
      const res = await acceptQuote(token);
      if (res.ok) setAccepted(true);
      else setError(res.error);
    });
  }

  if (accepted) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-green-100 px-5 py-3 text-sm font-semibold text-green-700">
        <Check className="h-4 w-4" /> Quote accepted — we&apos;ll be in touch to confirm details.
      </div>
    );
  }

  return (
    <div>
      <Button onClick={accept} size="lg" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Accept This Quote
      </Button>
      {error && <p className="mt-2 text-sm text-rodeo-600">{error}</p>}
    </div>
  );
}
