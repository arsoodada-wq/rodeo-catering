import type { Metadata } from "next";
import { resolvePageMetadata } from "@/lib/seo-overrides";
import { Hero } from "@/components/home/Hero";
import { WhyRodeo } from "@/components/home/WhyRodeo";
import { EventTypes } from "@/components/home/EventTypes";
import { MenuShowcase } from "@/components/home/MenuShowcase";
import { LiveCookoutAndCorporate } from "@/components/home/LiveCookoutAndCorporate";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { ServiceAreaAndFaq } from "@/components/home/ServiceAreaAndFaq";
import { FinalCta } from "@/components/home/FinalCta";

export async function generateMetadata(): Promise<Metadata> {
  return resolvePageMetadata("/", true);
}

export default function Home() {
  return (
    <>
      <Hero />
      <WhyRodeo />
      <EventTypes />
      <MenuShowcase />
      <LiveCookoutAndCorporate />
      <HowItWorks />
      <Testimonials />
      <ServiceAreaAndFaq />
      <FinalCta />
    </>
  );
}
