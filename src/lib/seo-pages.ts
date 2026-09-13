/**
 * The fixed set of static marketing pages an admin can override the SEO
 * title/description for at /admin/seo. Deliberately excludes dynamic
 * per-item pages (blog posts, service-area location pages) which already
 * have their own SEO fields in the database, and legal/noindex pages
 * (privacy policy, terms, accessibility, 404) which aren't meant to rank.
 *
 * `defaultTitle`/`defaultDescription` are the exact strings each page
 * already used before this override system existed — the single source of
 * truth both the live page and the admin screen's placeholder text read
 * from, so they can never drift apart the way the FAQ/service-area/review
 * fallbacks used to before those were fixed in earlier phases.
 */
export type ManagedSeoPage = {
  path: string;
  label: string;
  defaultTitle: string;
  defaultDescription: string;
};

export const SEO_MANAGED_PAGES: ManagedSeoPage[] = [
  {
    path: "/",
    label: "Homepage",
    defaultTitle: "Rodeo Burgers & Chicken Catering | Worth, IL",
    defaultDescription:
      "Catering for corporate events, birthdays, graduations, weddings, and more from Rodeo Burgers and Chicken in Worth, IL. Smash burgers, chicken, and live cookout catering.",
  },
  {
    path: "/catering",
    label: "Catering Hub",
    defaultTitle: "Catering Near Worth, IL",
    defaultDescription:
      "Request catering from Rodeo Burgers and Chicken for your corporate event, birthday, graduation, wedding, or gathering in Worth, IL.",
  },
  {
    path: "/about",
    label: "About",
    defaultTitle: "About",
    defaultDescription: "About Rodeo Burgers and Chicken Catering, based in Worth, IL.",
  },
  {
    path: "/corporate-catering",
    label: "Corporate Catering",
    defaultTitle: "Corporate Catering in Worth, IL",
    defaultDescription:
      "Corporate catering from Rodeo Burgers and Chicken — office lunches, meetings, employee appreciation, and company events in Worth, IL.",
  },
  {
    path: "/live-cookout-catering",
    label: "Live Cookout Catering",
    defaultTitle: "Live Cookout Catering in Worth, IL",
    defaultDescription:
      "Live cookout catering from Rodeo Burgers and Chicken in Worth, IL — our team cooks fresh, on-site, turning your event into a food experience.",
  },
  {
    path: "/birthday-party-catering",
    label: "Birthday Party Catering",
    defaultTitle: "Birthday Party Catering in Worth, IL",
    defaultDescription:
      "Birthday party catering from Rodeo Burgers and Chicken — smash burgers, chicken, and sides for celebrations of any size in Worth, IL.",
  },
  {
    path: "/graduation-catering",
    label: "Graduation Catering",
    defaultTitle: "Graduation Party Catering in Worth, IL",
    defaultDescription:
      "Graduation party catering from Rodeo Burgers and Chicken — feed an open house or grad party in Worth, IL with fresh smash burgers and chicken.",
  },
  {
    path: "/wedding-catering",
    label: "Wedding Catering",
    defaultTitle: "Wedding Catering in Worth, IL",
    defaultDescription:
      "Wedding catering from Rodeo Burgers and Chicken — a memorable, casual food option for rehearsal dinners and receptions in Worth, IL.",
  },
  {
    path: "/school-catering",
    label: "School Catering",
    defaultTitle: "School Event Catering in Worth, IL",
    defaultDescription:
      "School event catering from Rodeo Burgers and Chicken — fundraisers, staff appreciation, and field days in Worth, IL and nearby suburbs.",
  },
  {
    path: "/sports-team-catering",
    label: "Sports & Team Catering",
    defaultTitle: "Sports Team Catering in Worth, IL",
    defaultDescription:
      "Sports team catering from Rodeo Burgers and Chicken — game days, tournaments, and team celebrations in Worth, IL and nearby suburbs.",
  },
  {
    path: "/party-catering",
    label: "Party Catering",
    defaultTitle: "Party Catering in Worth, IL",
    defaultDescription:
      "Party catering from Rodeo Burgers and Chicken — smash burgers, chicken, and sides for family gatherings, holidays, and celebrations in Worth, IL and nearby suburbs.",
  },
  {
    path: "/large-group-catering",
    label: "Large Group Catering",
    defaultTitle: "Large Group Catering in Worth, IL",
    defaultDescription:
      "Large group catering from Rodeo Burgers and Chicken — full-scale event catering for 200+ guests in Worth, IL and nearby suburbs.",
  },
  {
    path: "/burger-catering",
    label: "Burger Catering",
    defaultTitle: "Smash Burger Catering in Worth, IL",
    defaultDescription:
      "Smash burger catering from Rodeo Burgers and Chicken — our signature smash technique, catered for any event in Worth, IL and nearby suburbs.",
  },
  {
    path: "/chicken-catering",
    label: "Chicken Catering",
    defaultTitle: "Chicken Catering in Worth, IL",
    defaultDescription:
      "Chicken catering from Rodeo Burgers and Chicken — wings, sandwiches, and bowls for any event in Worth, IL and nearby suburbs.",
  },
  {
    path: "/blog",
    label: "Blog / Catering Guides",
    defaultTitle: "Catering Guides | Worth, IL",
    defaultDescription:
      "Planning guides for corporate lunches, birthdays, graduations, weddings, and other events from Rodeo Burgers and Chicken Catering in Worth, IL.",
  },
];
