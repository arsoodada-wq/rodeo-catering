import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { business } from "@/lib/site-content";

export const metadata: Metadata = { title: "Privacy Policy", robots: { index: false } };

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <p>
        This page will describe what information Rodeo Burgers &amp; Chicken
        Catering collects through this site (such as catering request forms),
        how it is used, and how it is protected.
      </p>
      <h2>What we plan to cover</h2>
      <p>
        Information collected via the catering builder and quote forms;
        how contact information is used to follow up on catering requests;
        whether any data is shared with third parties (e.g. payment or email
        providers); how long information is retained; and how customers can
        request their information be corrected or removed.
      </p>
      <h2>Contact</h2>
      <p>
        Questions about this policy can be directed to {business.email} or{" "}
        {business.phone}.
      </p>
    </LegalPageShell>
  );
}
