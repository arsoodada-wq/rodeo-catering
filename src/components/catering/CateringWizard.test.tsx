// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CateringWizard } from "./CateringWizard";

const { submitCateringLead } = vi.hoisted(() => ({
  submitCateringLead: vi.fn(),
}));
vi.mock("@/app/actions/submit-catering-lead", () => ({ submitCateringLead }));

// Mirrors getMinSelectableDate()'s own local-calendar-day formatting in
// CateringWizard.tsx — using toISOString() here would format in UTC while
// the component compares in local time, making this helper's output drift
// a day off from the component's own math depending on timezone/time of day.
function dateString(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function setDate(value: string) {
  const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
  fireEvent.change(dateInput, { target: { value } });
}

/** Drives the wizard from step 0 through the Contact step (index 6), landing on Review (index 7). */
async function fillThroughToReview(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByText("Corporate"));
  await user.click(screen.getByRole("button", { name: /next/i }));

  await user.click(screen.getByText("21–50"));
  await user.click(screen.getByRole("button", { name: /next/i }));

  setDate(dateString(10));
  await user.click(screen.getByRole("button", { name: /next/i }));

  await user.type(screen.getByPlaceholderText("Worth"), "Worth");
  await user.click(screen.getByRole("button", { name: /next/i }));

  await user.click(screen.getByText("Pickup"));
  await user.click(screen.getByRole("button", { name: /next/i }));

  await user.click(screen.getByText("Flying Dutchman"));
  await user.click(screen.getByRole("button", { name: /next/i }));

  const contactStep = screen.getByText("How can we reach you?").closest("div")!.parentElement!;
  await user.type(within(contactStep).getByLabelText(/^Name/), "Jane Doe");
  await user.type(within(contactStep).getByLabelText(/^Email/), "jane@example.com");
  await user.click(screen.getByRole("button", { name: /next/i }));
}

describe("CateringWizard", () => {
  beforeEach(() => {
    submitCateringLead.mockReset();
  });

  it("disables Next on the first step until an event type is chosen", async () => {
    render(<CateringWizard confirmedServiceAreas={["Worth, IL"]} />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();

    const user = userEvent.setup();
    await user.click(screen.getByText("Corporate"));
    expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
  });

  it("keeps Next disabled on the contact step until a name and email or phone are given", async () => {
    const user = userEvent.setup();
    render(<CateringWizard confirmedServiceAreas={["Worth, IL"]} />);

    await user.click(screen.getByText("Corporate"));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByText("21–50"));
    await user.click(screen.getByRole("button", { name: /next/i }));

    setDate(dateString(10));
    await user.click(screen.getByRole("button", { name: /next/i }));

    await user.type(screen.getByPlaceholderText("Worth"), "Worth");
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByText("Pickup"));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /next/i })); // skip optional food step

    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();

    const contactStep = screen.getByText("How can we reach you?").closest("div")!.parentElement!;
    await user.type(within(contactStep).getByLabelText(/^Name/), "Jane Doe");
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();

    await user.type(within(contactStep).getByLabelText(/^Phone/), "7085551234");
    expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
  });

  it("rejects a date sooner than the minimum notice policy", async () => {
    const user = userEvent.setup();
    render(<CateringWizard confirmedServiceAreas={["Worth, IL"]} />);

    await user.click(screen.getByText("Corporate"));
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByText("21–50"));
    await user.click(screen.getByRole("button", { name: /next/i }));

    // Tomorrow is well short of the 48-hour minimum notice policy.
    setDate(dateString(1));
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
    expect(screen.getByText(/need at least 48 hours notice/i)).toBeInTheDocument();

    // A date past the minimum clears the warning and enables Next.
    setDate(dateString(10));
    expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
  });

  it("submits the exact form data to submitCateringLead and shows the success screen", async () => {
    submitCateringLead.mockResolvedValue({ ok: true, leadId: "lead-1" });
    const user = userEvent.setup();
    render(<CateringWizard confirmedServiceAreas={["Worth, IL"]} />);

    await fillThroughToReview(user);

    expect(screen.getByText(/Jane Doe — jane@example.com/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /submit catering request/i }));

    expect(submitCateringLead).toHaveBeenCalledTimes(1);
    const payload = submitCateringLead.mock.calls[0][0];
    expect(payload).toMatchObject({
      eventType: "CORPORATE",
      guestCount: 35,
      cateringStyle: "PICKUP",
      city: "Worth",
      name: "Jane Doe",
      email: "jane@example.com",
      foodSelections: ["Flying Dutchman"],
      website: undefined,
    });
    expect(typeof payload.formStartedAtMs).toBe("number");

    expect(await screen.findByText("Request received!")).toBeInTheDocument();
  });

  it("shows the server's error message instead of the success screen when submission fails", async () => {
    submitCateringLead.mockResolvedValue({
      ok: false,
      error: "Too many requests from this connection — please try again in a bit, or call us directly.",
    });
    const user = userEvent.setup();
    render(<CateringWizard confirmedServiceAreas={["Worth, IL"]} />);

    await fillThroughToReview(user);
    await user.click(screen.getByRole("button", { name: /submit catering request/i }));

    expect(await screen.findByText(/Too many requests/)).toBeInTheDocument();
    expect(screen.queryByText("Request received!")).not.toBeInTheDocument();
  });
});
