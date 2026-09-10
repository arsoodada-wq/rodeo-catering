import { Star, Award } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { reviews, award } from "@/lib/site-content";

export function Testimonials() {
  return (
    <section className="py-20">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">
              What People Are Saying
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
              Real reviews from real customers.
            </h2>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-rodeo-200 bg-rodeo-50 px-5 py-4">
            <Award className="h-6 w-6 shrink-0 text-rodeo-600" />
            <div>
              <p className="text-sm font-bold text-ink-900">{award.title}</p>
              <p className="text-xs text-ink-400">by {award.organization}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <figure
              key={review.name}
              className="rounded-2xl border border-ink-900/8 bg-white p-6"
            >
              <div className="flex" aria-hidden>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-rodeo-500 text-rodeo-500" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-ink-600">
                &ldquo;{review.text}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-sm font-bold text-ink-900">
                {review.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
