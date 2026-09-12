import { describe, expect, it, beforeEach } from "vitest";
import { checkRateLimit, _resetRateLimitsForTests } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    _resetRateLimitsForTests();
  });

  it("allows requests up to the limit within the window", () => {
    const key = "test@example.com";
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, 5, 60_000, 1000).allowed).toBe(true);
    }
  });

  it("blocks the request once the limit is exceeded", () => {
    const key = "test@example.com";
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60_000, 1000);
    }
    const result = checkRateLimit(key, 5, 60_000, 1000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("resets once the window has passed", () => {
    const key = "test@example.com";
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60_000, 1000);
    }
    expect(checkRateLimit(key, 5, 60_000, 1000).allowed).toBe(false);

    // 60 seconds later, a fresh window should start.
    expect(checkRateLimit(key, 5, 60_000, 61_001).allowed).toBe(true);
  });

  it("tracks separate keys independently", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("attacker@example.com", 5, 60_000, 1000);
    }
    expect(checkRateLimit("attacker@example.com", 5, 60_000, 1000).allowed).toBe(false);
    expect(checkRateLimit("innocent@example.com", 5, 60_000, 1000).allowed).toBe(true);
  });
});
