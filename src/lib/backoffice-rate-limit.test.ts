import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  resetBackofficeRateLimitMemoryForTests,
  tryConsumeBackofficeLoginSlot,
} from "./backoffice-rate-limit";

function makeRequest(ip = "203.0.113.10") {
  return new Request("https://example.com/api/backoffice/login", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("tryConsumeBackofficeLoginSlot", () => {
  beforeEach(() => {
    resetBackofficeRateLimitMemoryForTests();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.BACKOFFICE_LOGIN_RATE_LIMIT_MAX = "2";
    process.env.BACKOFFICE_LOGIN_RATE_LIMIT_WINDOW_SEC = "900";
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetBackofficeRateLimitMemoryForTests();
  });

  it("permite hasta el máximo y luego bloquea", async () => {
    expect((await tryConsumeBackofficeLoginSlot(makeRequest())).ok).toBe(true);
    expect((await tryConsumeBackofficeLoginSlot(makeRequest())).ok).toBe(true);
    const blocked = await tryConsumeBackofficeLoginSlot(makeRequest());
    expect(blocked.ok).toBe(false);
  });

  it("si Upstash falla, cae a memoria sin tirar error", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://invalid.upstash.example";
    process.env.UPSTASH_REDIS_REST_TOKEN = "bad-token";
    resetBackofficeRateLimitMemoryForTests();

    const first = await tryConsumeBackofficeLoginSlot(makeRequest("198.51.100.2"));
    expect(first.ok).toBe(true);
  });
});
