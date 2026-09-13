import type Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { business, cateringPolicy } from "@/lib/site-content";
import { getConfirmedServiceAreas } from "@/lib/public-data";
import { submitCateringLead, type CateringLeadInput } from "@/app/actions/submit-catering-lead";

/**
 * Every tool here either reads real, current data (menu, packages, service
 * areas, the lead-time policy) or submits a lead through the exact same
 * validated server action the step-by-step wizard uses. The concierge is
 * never given a way to state a price, a service area, or a policy that
 * isn't actually in the database — it can only report what these tools
 * return.
 */

export const conciergeTools: Anthropic.Tool[] = [
  {
    name: "get_menu_and_packages",
    description:
      "Get the current catering menu items and packages, including prices where the business has set one. Use this before discussing food options or pricing — never guess or make up a price.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_service_areas",
    description:
      "Get the list of cities the business currently confirms it caters to. Use this before telling a customer whether their location is covered.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "check_event_date",
    description:
      "Check whether a proposed event date meets the business's minimum notice policy. Always call this before confirming a date works.",
    input_schema: {
      type: "object",
      properties: {
        date: { type: "string", description: "The proposed event date, as YYYY-MM-DD." },
      },
      required: ["date"],
      additionalProperties: false,
    },
  },
  {
    name: "submit_catering_lead",
    description:
      "Submit a catering inquiry once you have gathered enough information AND the customer has explicitly confirmed they want you to submit it. Never call this without first summarizing the details back to the customer and getting a clear yes.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Customer's name." },
        email: { type: "string", description: "Customer's email (provide this or phone)." },
        phone: { type: "string", description: "Customer's phone number (provide this or email)." },
        company: { type: "string", description: "Company name, if this is a corporate event." },
        eventType: {
          type: "string",
          enum: [
            "CORPORATE",
            "BIRTHDAY",
            "GRADUATION",
            "WEDDING",
            "SCHOOL",
            "SPORTS_TEAM",
            "FAMILY_GATHERING",
            "COMMUNITY",
            "HOLIDAY",
            "OTHER",
          ],
        },
        guestCount: { type: "integer", minimum: 1 },
        eventDate: { type: "string", description: "YYYY-MM-DD, if known." },
        eventTime: { type: "string", description: "e.g. '6:00 PM', if known." },
        cateringStyle: {
          type: "string",
          enum: ["PICKUP", "DROP_OFF", "FULL_SERVICE", "LIVE_COOKOUT", "CORPORATE_LUNCH", "LARGE_EVENT"],
        },
        city: { type: "string", description: "City the event is in." },
        foodSelections: {
          type: "array",
          items: { type: "string" },
          description: "Menu items or packages the customer is interested in.",
        },
        notes: { type: "string", description: "Anything else worth passing to the catering team." },
      },
      required: ["name", "eventType", "guestCount", "cateringStyle"],
      additionalProperties: false,
    },
  },
];

async function getMenuAndPackages() {
  try {
    const [categories, packages] = await Promise.all([
      db.category.findMany({
        where: { kind: "MENU" },
        orderBy: { sortOrder: "asc" },
        include: { menuItems: { where: { available: true }, orderBy: { sortOrder: "asc" } } },
      }),
      db.package.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    ]);

    const menu = categories.map((c) => ({
      category: c.name,
      items: c.menuItems.map((item) => ({
        name: item.name,
        description: item.description ?? undefined,
        dietaryTags: item.dietaryTags,
        price:
          item.price !== null
            ? `$${item.price.toString()} ${item.pricingType === "PER_PERSON" ? "per person" : "flat"}`
            : "available on request — the team will quote this",
      })),
    }));

    const packageList = packages.map((p) => ({
      name: p.name,
      description: p.description ?? undefined,
      guestRange:
        p.minGuests || p.maxGuests
          ? `${p.minGuests ?? "?"}–${p.maxGuests ?? "no max"} guests`
          : undefined,
      price: p.pricePerPerson
        ? `$${p.pricePerPerson.toString()} per person`
        : p.basePrice
          ? `$${p.basePrice.toString()} base`
          : "custom quote — the team will price this based on your event",
    }));

    return { menu, packages: packageList };
  } catch {
    return { error: "Menu data is temporarily unavailable." };
  }
}

async function getServiceAreas() {
  const areas = await getConfirmedServiceAreas();
  return {
    homeBase: `${business.address.city}, ${business.address.state}`,
    confirmedAreas: areas,
  };
}

function checkEventDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return { valid: false, reason: "That doesn't look like a valid date." };
  }
  const minAllowed = Date.now() + cateringPolicy.minLeadTimeHours * 60 * 60 * 1000;
  const meetsPolicy = parsed.getTime() >= minAllowed;
  return {
    meetsMinimumNotice: meetsPolicy,
    minimumNoticeHours: cateringPolicy.minLeadTimeHours,
    message: meetsPolicy
      ? "This date meets the minimum notice requirement."
      : `This date is too soon — we require at least ${cateringPolicy.minLeadTimeHours} hours notice. Ask the customer for a later date.`,
  };
}

async function submitLead(input: Record<string, unknown>) {
  const leadInput: CateringLeadInput = {
    name: String(input.name ?? ""),
    email: typeof input.email === "string" ? input.email : "",
    phone: typeof input.phone === "string" ? input.phone : undefined,
    company: typeof input.company === "string" ? input.company : undefined,
    eventType: input.eventType as CateringLeadInput["eventType"],
    guestCount: Number(input.guestCount) || 1,
    eventDate: typeof input.eventDate === "string" ? input.eventDate : undefined,
    eventTime: typeof input.eventTime === "string" ? input.eventTime : undefined,
    cateringStyle: input.cateringStyle as CateringLeadInput["cateringStyle"],
    city: typeof input.city === "string" ? input.city : undefined,
    foodSelections: Array.isArray(input.foodSelections) ? (input.foodSelections as string[]) : [],
    notes: typeof input.notes === "string" ? input.notes : undefined,
    source: "AI_CONCIERGE",
  };

  const result = await submitCateringLead(leadInput);
  return result;
}

export async function executeConciergeTool(
  name: string,
  input: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "get_menu_and_packages":
      return getMenuAndPackages();
    case "get_service_areas":
      return getServiceAreas();
    case "check_event_date":
      return checkEventDate(String(input.date));
    case "submit_catering_lead":
      return submitLead(input);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
