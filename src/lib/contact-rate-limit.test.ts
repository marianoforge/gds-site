import { describe, it, expect, beforeEach } from "vitest";
import {
  getClientIp,
  tryConsumeContactSlot,
  resetContactRateLimitMemoryForTests,
} from "./contact-rate-limit";

describe("getClientIp", () => {
  it("toma la primera IP de x-forwarded-for", () => {
    const r = new Request("https://example.com", {
      headers: { "x-forwarded-for": " 203.0.113.1 , 10.0.0.1 " },
    });
    expect(getClientIp(r)).toBe("203.0.113.1");
  });

  it("usa x-real-ip si no hay forwarded", () => {
    const r = new Request("https://example.com", {
      headers: { "x-real-ip": "198.51.100.2" },
    });
    expect(getClientIp(r)).toBe("198.51.100.2");
  });

  it("prioriza x-forwarded-for sobre x-real-ip", () => {
    const r = new Request("https://example.com", {
      headers: {
        "x-forwarded-for": "1.2.3.4",
        "x-real-ip": "5.6.7.8",
      },
    });
    expect(getClientIp(r)).toBe("1.2.3.4");
  });

  it("devuelve unknown sin cabeceras", () => {
    const r = new Request("https://example.com");
    expect(getClientIp(r)).toBe("unknown");
  });
});

describe("tryConsumeContactSlot (memoria)", () => {
  beforeEach(() => {
    resetContactRateLimitMemoryForTests();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.CONTACT_RATE_LIMIT_MAX = "3";
    process.env.CONTACT_RATE_LIMIT_WINDOW_SEC = "60";
  });

  function req(ip: string) {
    return new Request("https://example.com", {
      headers: { "x-forwarded-for": ip },
    });
  }

  it("permite hasta el máximo y luego rechaza", async () => {
    expect((await tryConsumeContactSlot(req("10.0.0.1"))).ok).toBe(true);
    expect((await tryConsumeContactSlot(req("10.0.0.1"))).ok).toBe(true);
    expect((await tryConsumeContactSlot(req("10.0.0.1"))).ok).toBe(true);
    const fourth = await tryConsumeContactSlot(req("10.0.0.1"));
    expect(fourth.ok).toBe(false);
    if (!fourth.ok) {
      expect(fourth.retryAfterSec).toBeGreaterThan(0);
    }
  });

  it("cuenta por IP por separado", async () => {
    process.env.CONTACT_RATE_LIMIT_MAX = "1";
    expect((await tryConsumeContactSlot(req("10.0.0.10"))).ok).toBe(true);
    expect((await tryConsumeContactSlot(req("10.0.0.10"))).ok).toBe(false);
    expect((await tryConsumeContactSlot(req("10.0.0.11"))).ok).toBe(true);
  });
});
