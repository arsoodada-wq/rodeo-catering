import { business } from "@/lib/site-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * CateringBusiness schema built only from verified facts (address, phone,
 * email, socials — see src/lib/site-content.ts for sourcing). Deliberately
 * omits priceRange, areaServed beyond Worth, and any review/rating data:
 * none of that is confirmed yet. See SEO_GUIDE.md before adding those.
 */
export function LocalBusinessSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CateringBusiness",
    name: business.cateringBrand,
    url: siteUrl,
    telephone: business.phone,
    email: business.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.state,
      postalCode: business.address.zip,
      addressCountry: "US",
    },
    areaServed: {
      "@type": "City",
      name: "Worth, IL",
    },
    sameAs: [business.social.facebook, business.social.instagram],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
