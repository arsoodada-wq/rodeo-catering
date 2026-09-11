/**
 * Interim content source for the public site.
 *
 * Everything here is either (a) a verified fact from rodeoburgersandchicken.com
 * or supplied directly by the business owner, or (b) explicitly marked
 * "REQUIRES BUSINESS CONFIRMATION" / left as a placeholder. Once the admin
 * CMS (Page/SiteSetting/Package models) is wired up, this file is replaced by
 * database reads — the shape here mirrors those models on purpose so that
 * migration is a straight swap, not a rewrite.
 */

export const business = {
  legalName: "Rodeo Burgers and Chicken",
  cateringBrand: "Rodeo Burgers & Chicken Catering",
  phone: "(708) 608-8401",
  phoneHref: "tel:+17086088401",
  email: "info@rodeoburgersandchicken.com",
  address: {
    street: "11111 S Harlem Ave Unit E",
    city: "Worth",
    state: "IL",
    zip: "60482",
  },
  social: {
    facebook: "https://www.facebook.com/rodeoburgersandchicken",
    instagram: "https://www.instagram.com/rodeoburgersandchicken/",
  },
  restaurantSite: "https://www.rodeoburgersandchicken.com",
} as const;

// Confirmed directly by the business: catering orders require 48 hours
// notice. Used to grey out too-soon dates in the catering wizard and to
// answer the "how far in advance" FAQ — keep both in sync with this value.
export const cateringPolicy = {
  minLeadTimeHours: 48,
} as const;

export const award = {
  organization: "5 Reasons to Visit",
  title: "Nominated for Best Smash Burgers in Illinois",
  blurb:
    "Rodeo Burgers and Chicken was nominated for Best Smash Burgers in Illinois by 5 Reasons to Visit.",
} as const;

export const eventTypes = [
  { key: "corporate", label: "Corporate", description: "Office lunches, meetings & employee appreciation" },
  { key: "birthday", label: "Birthday", description: "Kids' parties to milestone birthdays" },
  { key: "graduation", label: "Graduation", description: "Open houses and grad parties" },
  { key: "wedding", label: "Wedding", description: "Rehearsal dinners & receptions" },
  { key: "school", label: "School Event", description: "Fundraisers, staff appreciation, field days" },
  { key: "sports", label: "Sports & Team", description: "Game day, tournaments, team banquets" },
  { key: "family", label: "Family Gathering", description: "Reunions, holidays, cookouts" },
  { key: "community", label: "Community & Church", description: "Fellowship events and fundraisers" },
] as const;

// Adapted from the public restaurant menu — see prisma/seed.ts for the
// structured version. Pricing intentionally omitted everywhere: it is not
// published anywhere and must come from the admin dashboard once set.
export const menuHighlights = [
  {
    category: "Smash Burgers",
    items: ["Flamin' Rodeo Burger", "Jalapeño Popper Burger", "UFO Burger", "Flying Dutchman"],
  },
  {
    category: "Chicken",
    items: ["Crispy Chicken Sandwich", "Chicken Wings", "Buffalo Chicken Bowl", "Plant-Based Bowl (Vegan)"],
  },
  {
    category: "Sides & Desserts",
    items: ["Supreme Fries", "Flamin' Rodeo Supreme Nachos", "Ice Cream Saucers", "Luscious Lemon Squares"],
  },
] as const;

// Package shells — mirrors prisma/seed.ts Package rows. No prices shown
// anywhere: pricing is not published and must come from the business.
export const packages = [
  { slug: "office-lunch", name: "Office Lunch Package", description: "Individually-ready meals for meetings and workdays." },
  { slug: "birthday-party", name: "Birthday Party Package", description: "Crowd-pleasing favorites built for celebrating." },
  { slug: "graduation", name: "Graduation Package", description: "Feed an open house or grad party with ease." },
  { slug: "family-party", name: "Family Party Package", description: "Reunions, holidays, and backyard get-togethers." },
  { slug: "corporate", name: "Corporate Package", description: "Larger company events and appreciation days." },
  { slug: "game-day", name: "Game Day Package", description: "Tailgates, tournaments, and team celebrations." },
  { slug: "big-event", name: "Big Event Package", description: "200+ guests — full-scale event catering." },
  { slug: "rodeo-signature", name: "Rodeo Signature Package", description: "Our full lineup of fan-favorite items." },
  { slug: "live-cookout", name: "Live Cookout Package", description: "Cooked fresh, right at your event." },
] as const;

export const processSteps = [
  {
    title: "Tell Us About Your Event",
    description: "Guest count, date, location, and event type.",
  },
  {
    title: "Build Your Menu",
    description: "Choose packages, food, sides, and add-ons.",
  },
  {
    title: "Review Your Quote",
    description: "Receive a professional estimate from our catering team.",
  },
  {
    title: "Confirm Your Catering",
    description: "Finalize details with the Rodeo team.",
  },
  {
    title: "Enjoy Your Event",
    description: "Rodeo handles the food so you can focus on your guests.",
  },
] as const;

// Reused verbatim from the business's own public site (not fabricated).
export const reviews = [
  {
    name: "Ramzan A.",
    rating: 5,
    text: "Awesome experience. I got the 6 pc chicken wing with lemon pepper and they're some of the best wings I've ever had.",
  },
  {
    name: "Patrick C.",
    rating: 5,
    text: "This place has the absolute BEST smash burgers around. The entire staff are friendly and attentive and very welcoming.",
  },
  {
    name: "Gina T.",
    rating: 5,
    text: "Loved Rodeo Burger & Chicken! Their burgers are deliciously juicy and perfectly cooked. The loaded fries were crispy, cheesy, and absolutely addictive.",
  },
] as const;

// Only areas the business has confirmed are listed as servable. See
// prisma/seed.ts ServiceArea rows for the full (mostly inactive) candidate
// list awaiting confirmation.
export const confirmedServiceAreas = ["Worth, IL"] as const;
