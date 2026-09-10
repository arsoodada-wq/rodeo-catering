import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { business } from "@/lib/site-content";

export const metadata: Metadata = { title: "Terms & Conditions", robots: { index: false } };

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms & Conditions">
      <p>
        This page will set out the terms for using this site and for
        booking catering through it, including catering-specific terms such
        as deposits, cancellations, and refunds.
      </p>
      <h2>What we plan to cover</h2>
      <p>
        Catering booking terms (deposit requirements, final headcount
        deadlines, cancellation windows and any fees); payment terms once
        online payment is enabled; liability limitations; and acceptable use
        of this website.
      </p>
      <h2>Contact</h2>
      <p>
        Questions can be directed to {business.email} or {business.phone}.
      </p>
    </LegalPageShell>
  );
}
