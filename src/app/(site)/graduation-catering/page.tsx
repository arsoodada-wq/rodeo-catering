import type { Metadata } from "next";
import { GraduationCap, Users, Clock, HandPlatter } from "lucide-react";
import { EventLandingTemplate } from "@/components/catering/EventLandingTemplate";
import { resolvePageMetadata } from "@/lib/seo-overrides";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata("/graduation-catering");
}

export default function GraduationCateringPage() {
  return (
    <EventLandingTemplate
      eyebrow="Graduation Catering"
      title="Feed the open house without the stress."
      intro="Graduation season means a steady stream of guests. We'll help you plan food that holds up all afternoon, so you can spend the day celebrating instead of cooking."
      ctaLabel="Plan Your Graduation Party"
      highlights={[
        { icon: GraduationCap, title: "Built for Open Houses", description: "Food that works whether guests arrive at noon or 6pm." },
        { icon: Users, title: "Any Guest Count", description: "From a small family gathering to a full open house." },
        { icon: Clock, title: "Ready When You Need It", description: "Tell us your timeline and we'll plan around it." },
        { icon: HandPlatter, title: "Pickup or Drop-Off", description: "Choose the service level that fits your event." },
      ]}
    />
  );
}
