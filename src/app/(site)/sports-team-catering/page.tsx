import type { Metadata } from "next";
import { Trophy, Users, Clock, HandPlatter } from "lucide-react";
import { EventLandingTemplate } from "@/components/catering/EventLandingTemplate";

export const metadata: Metadata = {
  title: "Sports Team Catering in Worth, IL",
  description:
    "Sports team catering from Rodeo Burgers and Chicken — game days, tournaments, and team celebrations in Worth, IL and nearby suburbs.",
};

export default function SportsTeamCateringPage() {
  return (
    <EventLandingTemplate
      eyebrow="Sports & Team Catering"
      title="Post-game and tournament-ready."
      intro="Hungry teams need food that shows up on time and disappears fast. We cater game days, tournaments, and end-of-season celebrations."
      ctaLabel="Plan Your Team Event"
      highlights={[
        { icon: Trophy, title: "Built for Game Day", description: "Food that's ready when the whistle blows, win or lose." },
        { icon: Clock, title: "Tournament-Day Timing", description: "We work around back-to-back game schedules." },
        { icon: Users, title: "Feeds the Whole Roster", description: "Players, coaches, and families — any headcount." },
        { icon: HandPlatter, title: "Pickup or Drop-Off", description: "Choose the service level that fits the event." },
      ]}
    />
  );
}
