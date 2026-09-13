import { defineConfig, devices } from "@playwright/test";

// A real browser driving the actual dev server against the actual local
// database — the one thing the mocked unit/component tests and the
// real-database action tests still can't cover: that a customer can
// genuinely click through the site and it works end to end.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
