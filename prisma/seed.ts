/**
 * Seed data sourced only from verified business facts:
 * - Public content on rodeoburgersandchicken.com (address, phone, hours, menu names, socials)
 * - Facts the business owner supplied directly (the "5 Reasons to Visit" nomination)
 *
 * Nothing here invents a price, service area, or review. Anything the
 * business hasn't confirmed is left null/inactive and labeled so the admin
 * dashboard surfaces it as "REQUIRES BUSINESS CONFIRMATION".
 */
import { PrismaClient, Prisma } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  // ── Site settings (single source of truth for confirmed business facts) ──
  await db.siteSetting.createMany({
    data: [
      {
        key: "business.name",
        value: "Rodeo Burgers and Chicken",
        description: "Legal / display business name",
      },
      {
        key: "business.cateringBrandName",
        value: "Rodeo Burgers & Chicken Catering",
        description: "Brand name used on this catering site",
      },
      {
        key: "business.address",
        value: {
          street: "11111 S Harlem Ave Unit E",
          city: "Worth",
          state: "IL",
          zip: "60482",
        },
        description: "Source: rodeoburgersandchicken.com",
      },
      {
        key: "business.phone",
        value: "(708) 608-8401",
        description: "Source: rodeoburgersandchicken.com",
      },
      {
        key: "business.email",
        value: "info@rodeoburgersandchicken.com",
        description: "Source: rodeoburgersandchicken.com",
      },
      {
        key: "business.cateringDomain",
        value: Prisma.JsonNull,
        description:
          "REQUIRES BUSINESS CONFIRMATION — production domain for this catering site (e.g. rodeoburgerscatering.com). Set NEXT_PUBLIC_SITE_URL once chosen.",
      },
      {
        key: "social.facebook",
        value: "https://www.facebook.com/rodeoburgersandchicken",
        description: "Source: rodeoburgersandchicken.com",
      },
      {
        key: "social.instagram",
        value: "https://www.instagram.com/rodeoburgersandchicken/",
        description: "Source: rodeoburgersandchicken.com",
      },
      {
        key: "brand.primaryColor",
        value: "#db594b",
        description: "Source: rodeoburgersandchicken.com theme-color meta tag",
      },
      {
        key: "brand.font",
        value: "Poppins",
        description: "Source: rodeoburgersandchicken.com",
      },
      {
        key: "catering.minimumGuests",
        value: Prisma.JsonNull,
        description: "REQUIRES BUSINESS CONFIRMATION",
      },
      {
        key: "catering.leadTimeDays",
        value: Prisma.JsonNull,
        description: "REQUIRES BUSINESS CONFIRMATION — how far in advance to book",
      },
    ],
    skipDuplicates: true,
  });

  // ── Award / recognition (wording exactly as the owner provided) ──
  await db.awardRecognition.upsert({
    where: { id: "seed-award-5-reasons" },
    create: {
      id: "seed-award-5-reasons",
      organization: "5 Reasons to Visit",
      title: "Nominated for Best Smash Burgers in Illinois",
      description:
        "Rodeo Burgers and Chicken was nominated for Best Smash Burgers in Illinois by 5 Reasons to Visit.",
      displayHomepage: true,
      displayCateringPages: true,
      active: true,
      sortOrder: 0,
    },
    update: {},
  });

  // ── Service areas — only Worth is confirmed active. Nearby suburbs are
  // seeded inactive so the admin can enable + write real page content once
  // the business confirms it actually delivers/caters there. ──
  await db.serviceArea.upsert({
    where: { slug: "worth-il" },
    create: {
      slug: "worth-il",
      city: "Worth",
      state: "IL",
      active: true,
      deliveryAvailable: true,
      notes: "Home base — confirmed via existing restaurant location.",
    },
    update: {},
  });

  const candidateSuburbs = [
    "Palos Heights",
    "Palos Hills",
    "Chicago Ridge",
    "Oak Lawn",
    "Orland Park",
    "Tinley Park",
    "Bridgeview",
    "Hickory Hills",
    "Alsip",
    "Evergreen Park",
    "Burbank",
    "Chicago",
  ];
  for (const city of candidateSuburbs) {
    const slug = `${city.toLowerCase().replace(/\s+/g, "-")}-il`;
    await db.serviceArea.upsert({
      where: { slug },
      create: {
        slug,
        city,
        state: "IL",
        active: false,
        deliveryAvailable: false,
        notes: "REQUIRES BUSINESS CONFIRMATION before enabling a location page.",
      },
      update: {},
    });
  }

  // ── Menu categories + items, adapted from the public menu. Prices are
  // intentionally null until the business sets catering pricing. ──
  const categories = [
    { slug: "smash-burgers", name: "Smash Burgers", kind: "MENU" as const },
    { slug: "chicken", name: "Chicken", kind: "MENU" as const },
    { slug: "sides", name: "Sides", kind: "MENU" as const },
    { slug: "desserts", name: "Desserts", kind: "MENU" as const },
  ];
  const categoryRecords = new Map<string, string>();
  for (const [i, c] of categories.entries()) {
    const rec = await db.category.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, name: c.name, kind: c.kind, sortOrder: i },
      update: {},
    });
    categoryRecords.set(c.slug, rec.id);
  }

  const menuItems: Array<{
    slug: string;
    name: string;
    category: string;
    dietaryTags?: string[];
    description?: string;
  }> = [
    { slug: "flamin-rodeo-burger", name: "Flamin' Rodeo Burger", category: "smash-burgers", description: "100% Angus smash burger with heat." },
    { slug: "jalapeno-popper-burger", name: "Jalapeño Popper Burger", category: "smash-burgers" },
    { slug: "classic-smash-single", name: "Classic Smash Burger (Single)", category: "smash-burgers" },
    { slug: "classic-smash-double", name: "Classic Smash Burger (Double)", category: "smash-burgers" },
    { slug: "ufo-burger", name: "UFO Burger", category: "smash-burgers", description: "Sealed flying-saucer-style stuffed burger." },
    { slug: "flying-dutchman", name: "Flying Dutchman", category: "smash-burgers", description: "Double patty, cheese-crusted grilled onion bun." },
    { slug: "chicken-wings", name: "Chicken Wings", category: "chicken" },
    { slug: "crispy-chicken-sandwich", name: "Crispy Chicken Sandwich", category: "chicken" },
    { slug: "buffalo-chicken-bowl", name: "Buffalo Chicken Bowl", category: "chicken" },
    { slug: "fried-chicken-bowl", name: "Fried Chicken Bowl", category: "chicken" },
    { slug: "plant-based-bowl", name: "Plant-Based Bowl", category: "chicken", dietaryTags: ["vegan"] },
    { slug: "supreme-fries", name: "Supreme Fries", category: "sides" },
    { slug: "flamin-rodeo-nachos", name: "Flamin' Rodeo Supreme Nachos", category: "sides" },
    { slug: "ice-cream-saucers", name: "Ice Cream Saucers", category: "desserts" },
    { slug: "lemon-squares", name: "Luscious Lemon Squares", category: "desserts" },
  ];

  for (const [i, item] of menuItems.entries()) {
    await db.menuItem.upsert({
      where: { slug: item.slug },
      create: {
        slug: item.slug,
        name: item.name,
        description: item.description,
        categoryId: categoryRecords.get(item.category)!,
        pricingType: "PER_PERSON",
        dietaryTags: item.dietaryTags ?? [],
        sortOrder: i,
        adminNotes: "Price REQUIRES BUSINESS CONFIRMATION before publishing.",
      },
      update: {},
    });
  }

  // ── Package shells (structure only — no invented pricing) ──
  const packages = [
    { slug: "office-lunch", name: "Office Lunch Package", eventTypes: ["CORPORATE" as const] },
    { slug: "birthday-party", name: "Birthday Party Package", eventTypes: ["BIRTHDAY" as const] },
    { slug: "graduation", name: "Graduation Package", eventTypes: ["GRADUATION" as const] },
    { slug: "family-party", name: "Family Party Package", eventTypes: ["FAMILY_GATHERING" as const] },
    { slug: "corporate", name: "Corporate Package", eventTypes: ["CORPORATE" as const] },
    { slug: "game-day", name: "Game Day Package", eventTypes: ["SPORTS_TEAM" as const] },
    { slug: "big-event", name: "Big Event Package", eventTypes: ["OTHER" as const] },
    { slug: "rodeo-signature", name: "Rodeo Signature Package", eventTypes: [] },
    { slug: "live-cookout", name: "Live Cookout Package", eventTypes: [] },
  ];
  for (const [i, p] of packages.entries()) {
    await db.package.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        name: p.name,
        eventTypes: p.eventTypes,
        sortOrder: i,
        active: false, // stays hidden from the public site until priced
        seoDescription: "REQUIRES BUSINESS CONFIRMATION — pricing not yet set.",
      },
      update: {},
    });
  }

  // ── Reviews — reused verbatim from the business's own public site, not
  // fabricated. Admin should attach real source permalinks when known. ──
  await db.review.createMany({
    data: [
      {
        customerName: "Ramzan A.",
        rating: 5,
        reviewText:
          "Awesome experience. I got the 6 pc chicken wing with lemon pepper and they're some of the best wings I've ever had. The fries are great and their lemon pepper is to die for.",
        source: "Published on rodeoburgersandchicken.com",
        active: true,
      },
      {
        customerName: "Patrick C.",
        rating: 5,
        reviewText:
          "This place has the absolute BEST smash burgers around. The entire staff are friendly and attentive and very welcoming. They have healthy bowl options as well.",
        source: "Published on rodeoburgersandchicken.com",
        active: true,
      },
      {
        customerName: "Gina T.",
        rating: 5,
        reviewText:
          "Loved Rodeo Burger & Chicken! Their burgers are deliciously juicy and perfectly cooked. The loaded fries were crispy, cheesy, and absolutely addictive.",
        source: "Published on rodeoburgersandchicken.com",
        active: true,
      },
    ],
    skipDuplicates: true,
  });

  // ── FAQs — real, commonly-needed catering questions. Answers are left as
  // confirmation placeholders and INACTIVE until the business supplies the
  // real policy, so nothing unverified goes live by accident. ──
  const faqs = [
    "How far do you cater?",
    "How many people can you cater for?",
    "Do you offer corporate catering?",
    "Do you offer live cooking / on-site cookouts?",
    "How far in advance should I book catering?",
    "Do you offer delivery?",
    "Can I customize a catering package?",
    "Do you cater weddings?",
    "Do you cater school events?",
    "Do you cater large events (200+ guests)?",
    "What food options are available (vegan, halal, kosher, allergies)?",
    "How does catering pricing work?",
  ];
  for (const [i, q] of faqs.entries()) {
    await db.fAQ.upsert({
      where: { id: `seed-faq-${i}` },
      create: {
        id: `seed-faq-${i}`,
        question: q,
        answer: "REQUIRES BUSINESS CONFIRMATION",
        pages: ["catering"],
        sortOrder: i,
        active: false,
      },
      update: {},
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
