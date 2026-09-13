import type { Metadata } from "next";
import { Cake, Users, HandPlatter, Sparkles } from "lucide-react";
import { EventLandingTemplate } from "@/components/catering/EventLandingTemplate";
import { resolvePageMetadata } from "@/lib/seo-overrides";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata("/birthday-party-catering");
}

export default function BirthdayPartyCateringPage() {
  return (
    <EventLandingTemplate
      eyebrow="Birthday Party Catering"
      title="Burgers that make the birthday."
      intro="From kids' parties to milestone birthdays, we bring fresh smash burgers and crispy chicken so you can focus on the celebration."
      ctaLabel="Plan Your Party"
      highlights={[
        { icon: Cake, title: "Any Age, Any Crowd", description: "Menu options that work for kids' parties and adult celebrations alike." },
        { icon: Users, title: "Scales With Your Guest List", description: "From a small backyard party to a big milestone bash." },
        { icon: HandPlatter, title: "Pickup or Drop-Off", description: "Choose the service level that fits your party." },
        { icon: Sparkles, title: "Food People Remember", description: "Bold flavors that give your party something to talk about." },
      ]}
    />
  );
}
