import type { Metadata } from "next";
import { Drumstick, Flame, Users, HandPlatter } from "lucide-react";
import { EventLandingTemplate } from "@/components/catering/EventLandingTemplate";
import { resolvePageMetadata } from "@/lib/seo-overrides";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata("/chicken-catering");
}

export default function ChickenCateringPage() {
  return (
    <EventLandingTemplate
      eyebrow="Chicken Catering"
      title="Crispy, saucy, catered right."
      intro="Wings, crispy chicken sandwiches, and loaded bowls — a menu that works for game day, office lunches, or any event in between."
      ctaLabel="Order Chicken Catering"
      highlights={[
        { icon: Drumstick, title: "Wings, Sandwiches & Bowls", description: "A full chicken menu, not just one option." },
        { icon: Flame, title: "Customizable Heat", description: "From mild to lemon pepper to flamin' — dial it in for your crowd." },
        { icon: Users, title: "Any Event Size", description: "From a small office lunch to a full-scale event." },
        { icon: HandPlatter, title: "Plant-Based Option Available", description: "A plant-based bowl for guests who want it." },
      ]}
    />
  );
}
