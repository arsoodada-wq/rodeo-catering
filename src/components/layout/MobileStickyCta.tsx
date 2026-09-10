import { Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { business } from "@/lib/site-content";

export function MobileStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-ink-900/10 bg-cream-50/95 p-3 backdrop-blur md:hidden">
      <a
        href={business.phoneHref}
        aria-label={`Call ${business.phone}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink-900/15 text-ink-900"
      >
        <Phone className="h-5 w-5" />
      </a>
      <Button href="/catering#builder" size="md" className="w-full">
        Start Catering Order
      </Button>
    </div>
  );
}
