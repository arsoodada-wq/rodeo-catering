import type { Metadata } from "next";
import { Heart, Users, HandPlatter, Sparkles } from "lucide-react";
import { EventLandingTemplate } from "@/components/catering/EventLandingTemplate";

export const metadata: Metadata = {
  title: "Wedding Catering",
  description:
    "Wedding catering from Rodeo Burgers and Chicken — a memorable, casual food option for rehearsal dinners and receptions in Worth, IL.",
};

export default function WeddingCateringPage() {
  return (
    <EventLandingTemplate
      eyebrow="Wedding Catering"
      title="A wedding menu your guests actually talk about."
      intro="For rehearsal dinners, receptions, or a late-night bite, our smash burgers and chicken bring a casual, memorable option to your wedding weekend."
      ctaLabel="Plan Your Wedding Catering"
      highlights={[
        { icon: Heart, title: "Rehearsal Dinners & Receptions", description: "A relaxed alternative or complement to a formal plated meal." },
        { icon: Users, title: "Any Guest Count", description: "From an intimate rehearsal dinner to a full reception." },
        { icon: HandPlatter, title: "Full-Service Available", description: "Our team can set up, serve, and clean up on-site." },
        { icon: Sparkles, title: "A Memorable Touch", description: "Give your wedding weekend something guests won't forget." },
      ]}
    />
  );
}
