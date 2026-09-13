import type { Metadata } from "next";
import { School, Users, Clock, DollarSign } from "lucide-react";
import { EventLandingTemplate } from "@/components/catering/EventLandingTemplate";
import { resolvePageMetadata } from "@/lib/seo-overrides";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata("/school-catering");
}

export default function SchoolCateringPage() {
  return (
    <EventLandingTemplate
      eyebrow="School Event Catering"
      title="Fuel for field days and fundraisers."
      intro="From staff appreciation lunches to fundraiser nights and field days, we bring food that's easy to serve to a crowd and easier to love."
      ctaLabel="Plan Your School Event"
      highlights={[
        { icon: School, title: "Built for School Schedules", description: "Tell us your timeline and we'll plan delivery around it." },
        { icon: DollarSign, title: "Budget-Friendly Options", description: "Menu options that work for PTO budgets and fundraiser margins." },
        { icon: Users, title: "Feeds a Crowd", description: "From a classroom party to a whole-school event." },
        { icon: Clock, title: "Reliable Timing", description: "Food shows up ready to serve, on the schedule you need." },
      ]}
    />
  );
}
