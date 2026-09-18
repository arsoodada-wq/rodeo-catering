import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const findUnique = vi.fn();
vi.mock("@/lib/db", () => ({
  db: { siteSetting: { findUnique: (...args: unknown[]) => findUnique(...args) } },
}));

import { sendEmail, sendNewLeadNotification } from "./email";

const ORIGINAL_ENV = { ...process.env };

describe("sendEmail", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...ORIGINAL_ENV };
  });
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("logs instead of sending when RESEND_API_KEY is unset — the documented dev-safe default", async () => {
    delete process.env.RESEND_API_KEY;
    const fetchSpy = vi.spyOn(global, "fetch");
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await sendEmail({ to: "owner@example.com", subject: "Test", html: "<p>hi</p>", text: "hi" });

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("owner@example.com"));
  });

  it("calls the Resend API when a key is configured", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.EMAIL_FROM = "Rodeo Catering <catering@example.com>";
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ id: "email-1" }), { status: 200 }));

    await sendEmail({ to: "owner@example.com", subject: "Test", html: "<p>hi</p>", text: "hi" });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer re_test_key" }),
      })
    );
  });

  it("throws when the Resend API rejects the request, so the caller's try/catch can log it", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    vi.spyOn(global, "fetch").mockResolvedValue(new Response("invalid api key", { status: 401 }));

    await expect(
      sendEmail({ to: "owner@example.com", subject: "Test", html: "<p>hi</p>", text: "hi" })
    ).rejects.toThrow(/401/);
  });
});

describe("sendNewLeadNotification", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...ORIGINAL_ENV };
    // No /admin/notifications setting saved yet, by default — falls back to
    // the env var, same as before this admin panel existed.
    findUnique.mockReset().mockResolvedValue(null);
  });
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  const lead = {
    id: "lead-1",
    name: "Jane Doe",
    email: "jane@example.com",
    eventType: "GRADUATION",
    guestCount: 50,
    cateringStyle: "DROP_OFF",
  };

  it("does nothing when no ADMIN_NOTIFICATION_EMAIL is configured", async () => {
    delete process.env.ADMIN_NOTIFICATION_EMAIL;
    const fetchSpy = vi.spyOn(global, "fetch");
    await sendNewLeadNotification(lead);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("includes the key lead details when an admin email is configured and logging is used", async () => {
    process.env.ADMIN_NOTIFICATION_EMAIL = "owner@example.com";
    delete process.env.RESEND_API_KEY;
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await sendNewLeadNotification(lead);

    const logged = logSpy.mock.calls[0]?.[0] as string;
    expect(logged).toContain("Jane Doe");
    expect(logged).toContain("50");
    expect(logged).toContain("Graduation");
  });

  it("prefers the email saved at /admin/notifications over the env var fallback", async () => {
    process.env.ADMIN_NOTIFICATION_EMAIL = "env-fallback@example.com";
    delete process.env.RESEND_API_KEY;
    findUnique.mockResolvedValue({ value: { email: "admin-configured@example.com" } });
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await sendNewLeadNotification(lead);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("to=admin-configured@example.com"));
  });
});
