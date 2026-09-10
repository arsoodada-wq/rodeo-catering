import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { business } from "@/lib/site-content";

export function FinalCta() {
  return (
    <section className="py-20">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-8 py-16 text-center text-cream-50 md:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, var(--color-rodeo-700) 0%, transparent 50%)",
            }}
          />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              Let&apos;s cater your next event.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-cream-100/80">
              Build your order online, or talk to our catering team directly
              at {business.phone}.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/catering#builder" size="lg">
                Build Your Catering Order
              </Button>
              <Button
                href={business.phoneHref}
                size="lg"
                variant="ghost"
                className="border-cream-50/25 text-cream-50 hover:border-cream-50/60"
              >
                Call {business.phone}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
