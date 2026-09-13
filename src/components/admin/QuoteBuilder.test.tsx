// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuoteBuilder } from "./QuoteBuilder";

const { createQuote, updateQuote } = vi.hoisted(() => ({
  createQuote: vi.fn(),
  updateQuote: vi.fn(),
}));
vi.mock("@/app/actions/create-quote", () => ({ createQuote }));
vi.mock("@/app/actions/update-quote", () => ({ updateQuote }));

function totalsText() {
  return screen.getByText(/Subtotal \$/).textContent ?? "";
}

describe("QuoteBuilder", () => {
  beforeEach(() => {
    createQuote.mockReset();
    updateQuote.mockReset();
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn() }, configurable: true });
    }
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
  });

  it("recalculates the subtotal and total live as line items and fees change", async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder leadId="lead-1" />);

    expect(totalsText()).toContain("Subtotal $0.00");
    expect(totalsText()).toContain("Total $0.00");

    await user.type(screen.getByLabelText("Description"), "Burgers");
    fireEvent.change(screen.getByLabelText("Qty"), { target: { value: "10" } });
    fireEvent.change(screen.getByLabelText("Unit Price"), { target: { value: "12.5" } });

    expect(totalsText()).toContain("Subtotal $125.00");
    expect(totalsText()).toContain("Total $125.00");

    fireEvent.change(screen.getByLabelText("Fees ($)"), { target: { value: "20" } });
    fireEvent.change(screen.getByLabelText("Discount ($)"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("Tax ($)"), { target: { value: "10" } });

    // 125 subtotal + 20 fees + 10 tax - 5 discount = 150
    expect(totalsText()).toContain("Subtotal $125.00");
    expect(totalsText()).toContain("Total $150.00");
  });

  it("disables removing the only line item, and re-enables once a second exists", async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder leadId="lead-1" />);

    const removeButtons = () => screen.getAllByRole("button", { name: /remove line item/i });
    expect(removeButtons()[0]).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /add line item/i }));
    expect(removeButtons()).toHaveLength(2);
    expect(removeButtons()[0]).toBeEnabled();

    await user.click(removeButtons()[0]);
    expect(removeButtons()).toHaveLength(1);
    expect(removeButtons()[0]).toBeDisabled();
  });

  it("disables submit until at least one line item has a description", async () => {
    const user = userEvent.setup();
    render(<QuoteBuilder leadId="lead-1" />);

    expect(screen.getByRole("button", { name: /create & get link/i })).toBeDisabled();
    await user.type(screen.getByLabelText("Description"), "Burgers");
    expect(screen.getByRole("button", { name: /create & get link/i })).toBeEnabled();
  });

  it("creates a quote, filtering out blank rows, and shows the customer link", async () => {
    createQuote.mockResolvedValue({ ok: true, secureToken: "abc123" });
    const user = userEvent.setup();
    render(<QuoteBuilder leadId="lead-1" />);

    await user.type(screen.getByLabelText("Description"), "Burgers");
    await user.click(screen.getByRole("button", { name: /add line item/i })); // second row left blank
    await user.click(screen.getByRole("button", { name: /create & get link/i }));

    expect(await screen.findByText("Quote created")).toBeInTheDocument();
    expect(createQuote).toHaveBeenCalledTimes(1);
    const call = createQuote.mock.calls[0][0];
    expect(call.leadId).toBe("lead-1");
    expect(call.items).toEqual([{ description: "Burgers", quantity: 1, unitPrice: 0 }]);

    const linkInput = screen.getByDisplayValue(/\/quote\/abc123$/);
    expect(linkInput).toBeInTheDocument();
  });

  it("edits an existing quote via updateQuote and shows Saved", async () => {
    updateQuote.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    render(
      <QuoteBuilder
        leadId="lead-1"
        existingQuote={{
          id: "quote-1",
          secureToken: "tok-existing",
          items: [{ description: "Wings", quantity: 2, unitPrice: 15 }],
          fees: 0,
          discount: 0,
          tax: 0,
          depositAmount: null,
          termsText: null,
          expiresAt: null,
        }}
      />
    );

    expect(screen.getByDisplayValue(/\/quote\/tok-existing$/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    expect(updateQuote).toHaveBeenCalledTimes(1);
    expect(updateQuote.mock.calls[0][0]).toMatchObject({
      quoteId: "quote-1",
      items: [{ description: "Wings", quantity: 2, unitPrice: 15 }],
    });
    expect(await screen.findByText("Saved")).toBeInTheDocument();
  });

  it("shows the server's error message when saving fails", async () => {
    createQuote.mockResolvedValue({ ok: false, error: "Could not create this quote." });
    const user = userEvent.setup();
    render(<QuoteBuilder leadId="lead-1" />);

    await user.type(screen.getByLabelText("Description"), "Burgers");
    await user.click(screen.getByRole("button", { name: /create & get link/i }));

    expect(await screen.findByText("Could not create this quote.")).toBeInTheDocument();
  });

  it("copies the customer link to the clipboard", async () => {
    createQuote.mockResolvedValue({ ok: true, secureToken: "abc123" });
    const user = userEvent.setup();
    render(<QuoteBuilder leadId="lead-1" />);

    await user.type(screen.getByLabelText("Description"), "Burgers");
    await user.click(screen.getByRole("button", { name: /create & get link/i }));
    await screen.findByText("Quote created");

    await user.click(screen.getByRole("button", { name: /^copy$/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("/quote/abc123"));
    expect(await screen.findByRole("button", { name: /copied/i })).toBeInTheDocument();
  });
});
