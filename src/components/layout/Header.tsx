import Link from "next/link";
import { Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { business } from "@/lib/site-content";

const navLinks = [
  { href: "/catering", label: "Catering" },
  { href: "/corporate-catering", label: "Corporate" },
  { href: "/live-cookout-catering", label: "Live Cookout" },
  { href: "/catering#packages", label: "Packages" },
  { href: "/catering#faq", label: "FAQ" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/5 bg-cream-50/90 backdrop-blur">
      <Container className="flex h-18 items-center justify-between py-3">
        <Link href="/" className="flex flex-col leading-none">
          <span className="text-lg font-extrabold tracking-tight text-ink-900">
            RODEO
          </span>
          <span className="text-[11px] font-semibold tracking-[0.2em] text-rodeo-600">
            CATERING
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-600 transition-colors hover:text-rodeo-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href={business.phoneHref}
            className="flex items-center gap-1.5 text-sm font-semibold text-ink-900 hover:text-rodeo-600"
          >
            <Phone className="h-4 w-4" />
            {business.phone}
          </a>
          <Button href="/catering#builder" size="md">
            Build Your Catering Order
          </Button>
        </div>

        <Button href="/catering#builder" size="md" className="md:hidden">
          Start Order
        </Button>
      </Container>
    </header>
  );
}
