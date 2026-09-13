import "dotenv/config";
import { test, expect } from "@playwright/test";
import { findLeadByName, findLeadById, findQuoteByLeadId, findQuoteById, deleteTestData } from "./db";

// The one thing no mocked unit test, component test, or real-database
// action test can prove: that a real customer can click through the real
// site in a real browser and it actually works end to end, all the way
// through to a second, separate visitor (the customer) accepting the
// quote a first visitor's submission produced. State-changing steps go
// through the real UI; read-only verification reads straight from the
// database, the same real client the app itself uses.
test.describe.configure({ mode: "serial" });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const uniqueName = `E2E Lifecycle Test ${Date.now()}`;
let leadId: string | undefined;
let quoteId: string | undefined;

test.afterAll(async () => {
  await deleteTestData(leadId, quoteId).catch(() => {});
});

test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, "ADMIN_EMAIL/ADMIN_PASSWORD not configured");

test("a customer's wizard submission becomes an admin lead, a quote, and a confirmed booking", async ({
  page,
  context,
}) => {
  await test.step("customer submits the guided catering wizard", async () => {
    await page.goto("/catering#builder");
    // submitCateringLead treats a submission faster than a human could
    // plausibly fill an 8-step wizard as a bot signal and silently drops it
    // (while still showing the same success message, deliberately, so a
    // real bot can't tell) — wait out that floor before filling the form.
    await page.waitForTimeout(3200);

    await page.getByRole("button", { name: /^Corporate/ }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await page.getByRole("button", { name: "21–50" }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    const future = new Date();
    future.setDate(future.getDate() + 10);
    await page.locator('input[type="date"]').fill(future.toISOString().slice(0, 10));
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await page.getByPlaceholder("Worth").fill("Worth");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await page.getByRole("button", { name: /^Pickup/ }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await page.getByRole("button", { name: "Next", exact: true }).click(); // food selection is optional

    await page.getByLabel("Name", { exact: false }).fill(uniqueName);
    await page.getByLabel("Email", { exact: false }).fill("e2e-lifecycle-test@example.com");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await page.getByRole("button", { name: "Submit Catering Request" }).click();
    await expect(page.getByText("Request received!")).toBeVisible();
  });

  await test.step("the submission landed as a real lead", async () => {
    const lead = await findLeadByName(uniqueName);
    expect(lead).not.toBeNull();
    expect(lead!.eventType).toBe("CORPORATE");
    expect(lead!.guestCount).toBe(35);
    expect(lead!.city).toBe("Worth");
    expect(lead!.source).toBe("CATERING_WIZARD");
    leadId = lead!.id;
  });

  let quoteUrl = "";

  await test.step("admin signs in and creates a quote for that lead", async () => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(ADMIN_EMAIL!);
    await page.getByLabel("Password").fill(ADMIN_PASSWORD!);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL(/\/admin$/);

    await page.goto(`/admin/leads/${leadId}`);
    await expect(page.getByText(uniqueName)).toBeVisible();

    await page.getByLabel("Description").fill("Corporate Lunch Package");
    await page.getByLabel("Qty").fill("35");
    await page.getByLabel("Unit Price").fill("15");
    await page.getByRole("button", { name: "Create & Get Link" }).click();

    await expect(page.getByText("Quote created")).toBeVisible();
    quoteUrl = await page.locator("input[readonly]").inputValue();
    expect(quoteUrl).toContain("/quote/");
  });

  await test.step("the quote is real, and sent the lead to QUOTE_SENT", async () => {
    const quote = await findQuoteByLeadId(leadId!);
    expect(quote).not.toBeNull();
    expect(Number(quote!.total)).toBe(525); // 35 * $15
    expect(quote!.status).toBe("SENT");
    quoteId = quote!.id;

    const lead = await findLeadById(leadId!);
    expect(lead!.status).toBe("QUOTE_SENT");
  });

  await test.step("a separate customer visitor opens the link and accepts it", async () => {
    const customerContext = await context.browser()!.newContext();
    const customerPage = await customerContext.newPage();
    try {
      await customerPage.goto(quoteUrl);
      await expect(customerPage.getByRole("heading", { name: uniqueName })).toBeVisible();
      await expect(customerPage.getByText("$525").first()).toBeVisible();
      await customerPage.getByRole("button", { name: "Accept This Quote" }).click();
      // The client-side confirmation and the server-revalidated "already
      // accepted" state say it slightly differently — either is proof the
      // acceptance actually went through.
      await expect(customerPage.getByText(/accepted/i)).toBeVisible();
    } finally {
      await customerContext.close();
    }
  });

  await test.step("the acceptance is real: quote ACCEPTED, lead CONFIRMED", async () => {
    const quote = await findQuoteById(quoteId!);
    expect(quote!.status).toBe("ACCEPTED");
    expect(quote!.acceptedAt).not.toBeNull();

    const lead = await findLeadById(leadId!);
    expect(lead!.status).toBe("CONFIRMED");
  });
});
