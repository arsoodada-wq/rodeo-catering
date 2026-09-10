import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { business } from "@/lib/site-content";

export const metadata: Metadata = { title: "Accessibility Statement", robots: { index: false } };

export default function AccessibilityPage() {
  return (
    <LegalPageShell title="Accessibility Statement">
      <p>
        Rodeo Burgers &amp; Chicken Catering is working toward WCAG 2.2 AA
        conformance across this site. This statement will be finalized once
        an accessibility review has been completed.
      </p>
      <h2>Feedback</h2>
      <p>
        If you encounter an accessibility barrier anywhere on this site,
        please contact us at {business.email} or {business.phone} so we can
        address it.
      </p>
    </LegalPageShell>
  );
}
