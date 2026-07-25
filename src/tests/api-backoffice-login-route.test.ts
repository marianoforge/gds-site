import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/backoffice/login/route";
import { resetBackofficeRateLimitMemoryForTests } from "@/lib/backoffice-rate-limit";

function makeRequest(body: unknown) {
  return new Request("https://www.gustavodesimone.com/api/backoffice/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "203.0.113.77",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/backoffice/login", () => {
  beforeEach(() => {
    resetBackofficeRateLimitMemoryForTests();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.BACKOFFICE_USERNAME = "admin";
    process.env.BACKOFFICE_PASSWORD = "secret";
    process.env.BACKOFFICE_AUTH_SECRET = "auth-secret-for-tests";
    process.env.BACKOFFICE_LOGIN_RATE_LIMIT_MAX = "10";
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetBackofficeRateLimitMemoryForTests();
  });

  it("rechaza credenciales inválidas con 401", async () => {
    const res = await POST(makeRequest({ username: "admin", password: "wrong" }));
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Credenciales inválidas" });
  });

  it("acepta credenciales válidas y setea cookie", async () => {
    const res = await POST(makeRequest({ username: "admin", password: "secret" }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("gds_backoffice_session=");
  });

  it("responde 503 si falta config", async () => {
    delete process.env.BACKOFFICE_AUTH_SECRET;
    const res = await POST(makeRequest({ username: "admin", password: "secret" }));
    expect(res.status).toBe(503);
  });
});
