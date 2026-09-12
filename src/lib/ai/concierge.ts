import Anthropic from "@anthropic-ai/sdk";
import { business, cateringPolicy, eventTypes } from "@/lib/site-content";
import { conciergeTools, executeConciergeTool } from "@/lib/ai/tools";

// Mirrors the CateringStyleValue enum used by submitCateringLead — just
// labels for the system prompt, not validated logic, so a plain local list
// here (rather than importing CateringWizard's typed version) is fine.
const cateringStyleLabels = [
  "Pickup",
  "Drop-Off",
  "Full Service",
  "Live Cookout",
  "Corporate Lunch",
  "Large Event (200+ guests)",
];

// Configurable so the business can trade quality for cost — Sonnet is a
// reasonable default for a customer-facing chat that mostly does
// structured extraction and tool calls, not open-ended reasoning.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
const MAX_TOOL_ITERATIONS = 6;

export type ConciergeMessage = { role: "user" | "assistant"; content: string };

function buildSystemPrompt(): string {
  const eventTypeList = eventTypes.map((e) => e.label).join(", ");
  const styleList = cateringStyleLabels.join(", ");

  return `You are the catering concierge for ${business.cateringBrand}, based in ${business.address.city}, ${business.address.state}. You help website visitors plan catering by chatting naturally, then submit a lead for the human catering team to follow up with an actual quote.

Ground rules:
- You NEVER state a price, a service area, or a policy from memory — always call the relevant tool first (get_menu_and_packages, get_service_areas, check_event_date) and report only what it returns. If a price isn't set, say the team will quote it — never invent a number.
- Minimum notice for any event is ${cateringPolicy.minLeadTimeHours} hours. Always call check_event_date once you have a proposed date, before treating it as confirmed.
- Event types you can offer: ${eventTypeList}. Catering styles: ${styleList}.
- You are not able to guarantee availability, finalize pricing, or make promises the human team hasn't confirmed — you gather details and hand off.
- Before calling submit_catering_lead, summarize what you have (event type, guest count, date if known, style, contact info, any food preferences) in plain language and get an explicit yes from the customer. Only call it once per conversation.
- You need at minimum: name, email or phone, event type, guest count, and catering style before you can submit. Ask for whatever's missing, one or two questions at a time — don't interrogate.
- If asked something outside catering (or to do something other than plan a catering order), politely redirect to catering planning, or suggest calling ${business.phone} for anything else.
- Keep responses conversational and concise — this is a chat widget, not an essay.`;
}

export type ConciergeTurnResult = {
  reply: string;
  leadSubmitted: boolean;
};

export async function runConciergeTurn(
  history: ConciergeMessage[]
): Promise<ConciergeTurnResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  const client = new Anthropic({ apiKey });

  const messages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let leadSubmitted = false;

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: buildSystemPrompt(),
      tools: conciergeTools,
      messages,
    });

    if (response.stop_reason !== "tool_use") {
      const textBlock = response.content.find(
        (b): b is Anthropic.TextBlock => b.type === "text"
      );
      return { reply: textBlock?.text ?? "Sorry, I didn't catch that — could you rephrase?", leadSubmitted };
    }

    messages.push({ role: "assistant", content: response.content });

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      const result = await executeConciergeTool(
        block.name,
        (block.input as Record<string, unknown>) ?? {}
      );
      if (block.name === "submit_catering_lead" && (result as { ok?: boolean }).ok) {
        leadSubmitted = true;
      }
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: JSON.stringify(result),
      });
    }

    messages.push({ role: "user", content: toolResults });
  }

  return {
    reply: "I'm having trouble finishing that up — could you call us directly at " + business.phone + "?",
    leadSubmitted,
  };
}
