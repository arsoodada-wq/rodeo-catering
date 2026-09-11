import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { business } from "@/lib/site-content";
import { getConfirmedServiceAreas } from "@/lib/public-data";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-8.1h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.6 1.6-1.6h1.7V3.1C16.5 3 15.4 3 14.2 3c-2.6 0-4.4 1.6-4.4 4.5v2.2H7v3.2h2.8V21h3.7Z" />
    </svg>
  );
}

const cateringLinks = [
  { href: "/catering", label: "Catering Home" },
  { href: "/corporate-catering", label: "Corporate Catering" },
  { href: "/live-cookout-catering", label: "Live Cookout Catering" },
  { href: "/birthday-party-catering", label: "Birthday Parties" },
  { href: "/graduation-catering", label: "Graduations" },
  { href: "/wedding-catering", label: "Weddings" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/catering#faq", label: "FAQs" },
  { href: "/blog", label: "Catering Guides" },
  { href: business.restaurantSite, label: "Regular Menu & Ordering" },
];

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/accessibility", label: "Accessibility" },
];

export async function Footer() {
  const confirmedServiceAreas = await getConfirmedServiceAreas();
  return (
    <footer className="border-t border-ink-900/10 bg-ink-900 text-cream-50">
      <Container className="grid grid-cols-2 gap-10 py-14 md:grid-cols-5">
        <div className="col-span-2">
          <p className="text-lg font-extrabold tracking-tight">RODEO CATERING</p>
          <p className="mt-3 max-w-xs text-sm text-cream-100/70">
            Bring the Rodeo to your next event. Catering by Rodeo Burgers and Chicken.
          </p>
          <div className="mt-5 flex gap-4">
            <a href={business.social.instagram} aria-label="Instagram" className="text-cream-50/80 hover:text-rodeo-400">
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a href={business.social.facebook} aria-label="Facebook" className="text-cream-50/80 hover:text-rodeo-400">
              <FacebookIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <FooterColumn title="Catering" links={cateringLinks} />
        <FooterColumn title="Company" links={companyLinks} />

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cream-50/60">Contact</p>
          <ul className="mt-4 space-y-3 text-sm text-cream-100/80">
            <li className="flex gap-2">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                {business.address.street}
                <br />
                {business.address.city}, {business.address.state} {business.address.zip}
              </span>
            </li>
            <li className="flex gap-2">
              <Phone className="h-4 w-4 shrink-0 mt-0.5" />
              <a href={business.phoneHref} className="hover:text-rodeo-400">{business.phone}</a>
            </li>
            <li className="flex gap-2">
              <Mail className="h-4 w-4 shrink-0 mt-0.5" />
              <a href={`mailto:${business.email}`} className="hover:text-rodeo-400 break-all">{business.email}</a>
            </li>
          </ul>
          <p className="mt-4 text-xs text-cream-50/50">
            Currently serving {confirmedServiceAreas.join(", ")}
          </p>
        </div>
      </Container>

      <div className="border-t border-cream-50/10">
        <Container className="flex flex-col gap-3 py-6 text-xs text-cream-50/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Rodeo Burgers and Chicken. All rights reserved.</p>
          <div className="flex gap-5">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-cream-50">
                {l.label}
              </Link>
            ))}
          </div>
        </Container>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-cream-50/60">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm text-cream-100/80">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:text-rodeo-400">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
