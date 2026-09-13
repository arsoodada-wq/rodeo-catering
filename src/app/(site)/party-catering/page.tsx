import type { Metadata } from "next";
import { PartyPopper, Sparkles, HandPlatter, Users } from "lucide-react";
import { EventLandingTemplate } from "@/components/catering/EventLandingTemplate";
import { resolvePageMetadata } from "@/lib/seo-overrides";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata("/party-catering");
}

export default function PartyCateringPage() {
  return (
    <EventLandingTemplate
      eyebrow="Party Catering"
      title="Bold flavors for any party."
      intro="Family reunions, holiday get-togethers, backyard hangouts — whatever the occasion, we bring the food and you skip the cooking."
      ctaLabel="Plan Your Party"
      highlights={[
        { icon: PartyPopper, title: "Any Occasion", description: "Reunions, holidays, and everything in between." },
        { icon: HandPlatter, title: "Pickup or Drop-Off", description: "Choose the service level that fits your party." },
        { icon: Users, title: "Any Guest Count", description: "From a small get-together to a full house." },
        { icon: Sparkles, title: "Crowd-Pleasing Menu", description: "Bold flavors that work for kids and adults alike." },
      ]}
    />
  );
}
