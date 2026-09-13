import type { Metadata } from "next";
import { Flame, Beef, Sparkles, HandPlatter } from "lucide-react";
import { EventLandingTemplate } from "@/components/catering/EventLandingTemplate";
import { resolvePageMetadata } from "@/lib/seo-overrides";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata("/burger-catering");
}

export default function BurgerCateringPage() {
  return (
    <EventLandingTemplate
      eyebrow="Smash Burger Catering"
      title="Smash burgers, catered."
      intro="The same smash-burger technique from our kitchen — fresh, never frozen — brought to your event, however big or small."
      ctaLabel="Order Burger Catering"
      image={{ src: "/images/rodeo/flying-dutchman-burger.jpg", alt: "The Flying Dutchman smash burger, stacked and dripping with cheese" }}
      highlights={[
        { icon: Flame, title: "Signature Smash Technique", description: "The same method that built our reputation, cooked for your event." },
        { icon: Beef, title: "Fresh, Never Frozen", description: "No shortcuts — the same quality as in our kitchen." },
        { icon: Sparkles, title: "Customizable Toppings", description: "Build a spread that fits your event and your guests." },
        { icon: HandPlatter, title: "Any Event Size", description: "From an office lunch to a full-scale event." },
      ]}
    />
  );
}
