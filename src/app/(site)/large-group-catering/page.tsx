import type { Metadata } from "next";
import { Users, Flame, HandPlatter, Clock } from "lucide-react";
import { EventLandingTemplate } from "@/components/catering/EventLandingTemplate";

export const metadata: Metadata = {
  title: "Large Group Catering in Worth, IL",
  description:
    "Large group catering from Rodeo Burgers and Chicken — full-scale event catering for 200+ guests in Worth, IL and nearby suburbs.",
};

export default function LargeGroupCateringPage() {
  return (
    <EventLandingTemplate
      eyebrow="Large Group Catering"
      title="Full-scale catering for 200+ guests."
      intro="Big events need a team that can scale. From large corporate gatherings to community events, we plan around your headcount and timeline."
      ctaLabel="Plan Your Large Event"
      highlights={[
        { icon: Users, title: "Built for Scale", description: "200+ guests, planned and executed without the guesswork." },
        { icon: Flame, title: "Live Cookout Option", description: "Cooked fresh on-site for a more memorable large event." },
        { icon: HandPlatter, title: "Full Service Available", description: "Our team can set up, serve, and clean up on-site." },
        { icon: Clock, title: "Dedicated Planning", description: "More lead time means more room to get every detail right." },
      ]}
    />
  );
}
