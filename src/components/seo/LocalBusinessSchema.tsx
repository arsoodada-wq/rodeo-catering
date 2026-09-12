import { business } from "@/lib/site-content";
import { getConfirmedServiceAreas } from "@/lib/public-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Worth, IL village center — sourced from Wikipedia/public GPS lookups, not
// business-confirmed data, so it's fine to hardcode here rather than route
// it through site-content.ts's "verified facts only" discipline.
const WORTH_COORDINATES = { latitude: 41.689, longitude: -87.793 };

// Confirmed by the business (2026-09-12): catering covers roughly a
// 15-mile radius from Worth. Reads active ServiceArea rows so this stays
// in sync with whatever's turned on in /admin/service-areas — see
// PROJECT_STATUS.md for the FAQ-answer bug this exact pattern was built to
// avoid repeating (free text that silently drifts from the real list).
export async function LocalBusinessSchema() {
  const activeAreas = await getConfirmedServiceAreas();

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
    areaServed: [
      {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: WORTH_COORDINATES.latitude,
          longitude: WORTH_COORDINATES.longitude,
        },
        geoRadius: "24140", // ~15 miles, in meters
      },
      ...activeAreas.map((name) => ({ "@type": "City" as const, name })),
    ],
    sameAs: [business.social.facebook, business.social.instagram],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
