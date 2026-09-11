import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CateringWizard } from "@/components/catering/CateringWizard";
import { PackagesTeaser } from "@/components/catering/PackagesTeaser";
import { ServiceAreaAndFaq } from "@/components/home/ServiceAreaAndFaq";
import { business } from "@/lib/site-content";
import { getConfirmedServiceAreas } from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Catering",
  description:
    "Request catering from Rodeo Burgers and Chicken for your corporate event, birthday, graduation, wedding, or gathering in Worth, IL.",
};

export default async function CateringPage() {
  const confirmedServiceAreas = await getConfirmedServiceAreas();
  return (
    <>
      <section className="bg-ink-900 py-16 text-cream-50 md:py-20">
        <Container>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-400">
              Catering
            </p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
              Let&apos;s build your event.
            </h1>
            <p className="mt-4 text-cream-100/80">
              Answer a few quick questions and our catering team will follow
              up with a detailed quote — no pricing surprises, no guesswork.
              Prefer to talk it through first? Call us at{" "}
              <a href={business.phoneHref} className="font-semibold text-rodeo-300">
                {business.phone}
              </a>
              .
            </p>
          </div>
        </Container>
      </section>

      <section id="builder" className="scroll-mt-20 py-16 md:py-20">
        <Container>
          <CateringWizard confirmedServiceAreas={confirmedServiceAreas} />
        </Container>
      </section>

      <PackagesTeaser />
      <ServiceAreaAndFaq />
    </>
  );
}
