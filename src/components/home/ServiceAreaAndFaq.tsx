import { MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { confirmedServiceAreas, business, cateringPolicy } from "@/lib/site-content";
import { db } from "@/lib/db";
import { getConfirmedServiceAreas } from "@/lib/public-data";

type DisplayFaq = { q: string; a: string };

// Fallback used only when the database is unreachable — kept in sync with
// the confirmed FAQ rows seeded in prisma/seed.ts, which is the real
// source of truth once the database is connected.
const fallbackFaqs: DisplayFaq[] = [
  {
    q: "Where are you located, and where do you cater?",
    a: `We're based at ${business.address.street}, ${business.address.city}, ${business.address.state} ${business.address.zip}. We currently confirm catering for ${confirmedServiceAreas.join(", ")} — contact us to check availability for your location.`,
  },
  {
    q: "How do I get a catering quote?",
    a: "Use the catering builder above to tell us about your event, or call us directly. We'll put together a detailed quote based on your guest count and menu selections.",
  },
  {
    q: "Can you accommodate dietary restrictions?",
    a: "We offer plant-based options on our menu. For specific allergy or dietary needs, please note them when requesting your quote so our team can confirm what's possible.",
  },
  {
    q: "How far in advance should I book?",
    a: `We require at least ${cateringPolicy.minLeadTimeHours} hours notice for all catering orders. For larger events, booking further ahead helps us confirm availability.`,
  },
];

async function getActiveFaqs(): Promise<DisplayFaq[]> {
  try {
    const faqs = await db.fAQ.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    if (faqs.length === 0) return fallbackFaqs;
    return faqs.map((f) => ({ q: f.question, a: f.answer }));
  } catch {
    return fallbackFaqs;
  }
}

export async function ServiceAreaAndFaq() {
  const [faqs, serviceAreas] = await Promise.all([getActiveFaqs(), getConfirmedServiceAreas()]);
  const homeLabel = `${business.address.city}, ${business.address.state}`;
  const otherAreas = serviceAreas.filter((area) => area !== homeLabel);

  return (
    <section id="faq" className="bg-cream-100 py-20">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">
              Service Area
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900">
              Proudly based in {homeLabel}.
            </h2>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-ink-900/8 bg-white p-5">
              <MapPin className="h-5 w-5 shrink-0 text-rodeo-600" />
              <div className="text-sm text-ink-600">
                <p className="font-semibold text-ink-900">
                  {business.address.street}
                </p>
                <p>
                  {business.address.city}, {business.address.state} {business.address.zip}
                </p>
                {otherAreas.length > 0 && (
                  <p className="mt-2">
                    <span className="font-semibold text-ink-900">Also serving: </span>
                    {otherAreas.join(", ")}
                  </p>
                )}
                <p className="mt-2 text-ink-400">
                  Interested in catering outside our confirmed area? Reach out
                  — we&apos;re actively expanding.
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">
              FAQ
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900">
              Common catering questions.
            </h2>
            <dl className="mt-6 space-y-5">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-2xl border border-ink-900/8 bg-white p-5">
                  <dt className="font-bold text-ink-900">{faq.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-ink-400">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
