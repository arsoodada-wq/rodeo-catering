import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Clock, Users, HandPlatter } from "lucide-react";
import { db } from "@/lib/db";
import { business } from "@/lib/site-content";
import { EventLandingTemplate } from "@/components/catering/EventLandingTemplate";
import { PackagesTeaser } from "@/components/catering/PackagesTeaser";
import { Testimonials } from "@/components/home/Testimonials";
import { ServiceAreaAndFaq } from "@/components/home/ServiceAreaAndFaq";

async function getServiceArea(slug: string) {
  try {
    return await db.serviceArea.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const area = await getServiceArea(slug);
  if (!area || !area.active) return { title: "Page Not Found", robots: { index: false, follow: false } };

  return {
    title: `Catering Near ${area.city}, ${area.state}`,
    description: `Rodeo Burgers and Chicken brings smash burgers, chicken, and live cookout catering to ${area.city}, ${area.state} — based minutes away in ${business.address.city}, ${business.address.state}.`,
  };
}

export default async function ServiceAreaCateringPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const area = await getServiceArea(slug);

  // 404 rather than show a page for a city that either doesn't exist or
  // isn't currently an active service area — publishing a page claiming
  // coverage the business hasn't confirmed would be worse than not
  // ranking for it at all.
  if (!area || !area.active) notFound();

  const highlights = [
    {
      icon: MapPin,
      title: `Minutes From ${area.city}`,
      description: `We're based in ${business.address.city}, ${business.address.state} — close enough for fast, fresh delivery to ${area.city}.`,
    },
    {
      icon: Clock,
      title: "48-Hour Lead Time",
      description: "Book at least 48 hours ahead and we'll confirm availability for your date.",
    },
    {
      icon: Users,
      title: "Any Guest Count",
      description: "From a small office lunch to a 200+ guest event, we scale to fit.",
    },
    {
      icon: HandPlatter,
      title: "Pickup, Drop-Off, or Full Service",
      description: "Choose the service level that fits your event and budget.",
    },
  ];

  return (
    <>
      <EventLandingTemplate
        eyebrow={`Now Serving ${area.city}, ${area.state}`}
        title={`Catering Near ${area.city}, ${area.state}`}
        intro={`Smash burgers, chicken, and live cookout catering for events in ${area.city} — corporate lunches, birthdays, graduations, weddings, and more, from a kitchen just up the road in ${business.address.city}, ${business.address.state}.`}
        highlights={highlights}
      />
      <PackagesTeaser ctaHref="/catering#builder" />
      <Testimonials />
      <ServiceAreaAndFaq />
    </>
  );
}
