import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { menuHighlights } from "@/lib/site-content";

// Real photos of an item actually listed in that category below — never a
// generic stand-in, so a category only gets an image when one of its own
// items has a real, verified photo to show.
const categoryPhotos: Record<string, { src: string; alt: string }> = {
  "Smash Burgers": { src: "/images/rodeo/flying-dutchman-burger.jpg", alt: "The Flying Dutchman smash burger" },
  Chicken: { src: "/images/rodeo/buffalo-chicken-bowl.jpeg", alt: "Buffalo Chicken Bowl" },
  "Sides & Desserts": { src: "/images/rodeo/flamin-rodeo-supreme-nachos.jpeg", alt: "Flamin' Rodeo Supreme Nachos" },
};

export function MenuShowcase() {
  return (
    <section className="py-20">
      <Container>
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-rodeo-600">
            The Food
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 md:text-4xl">
            Fan favorites, ready for catering.
          </h2>
          <p className="mt-4 text-ink-400">
            Every catering order is built from the same menu our regular
            customers love — smash burgers, crispy chicken, and the sides
            people order twice.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {menuHighlights.map((group) => {
            const photo = categoryPhotos[group.category];
            return (
              <div key={group.category} className="overflow-hidden rounded-2xl bg-ink-900 text-cream-50">
                {photo && (
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-7">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-rodeo-400">
                    {group.category}
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {group.items.map((item) => (
                      <li key={item} className="text-base font-medium text-cream-100/90">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <Button href="/catering#builder" size="lg">
            Build Your Menu
          </Button>
        </div>
      </Container>
    </section>
  );
}
