import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: vi.fn().mockResolvedValue({ data: { id: "mock" }, error: null }),
    };
  },
}));

vi.mock("@/lib/google-sheets-contact", () => ({
  appendContactRow: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "@/app/api/contact/route";
import { resetContactRateLimitMemoryForTests } from "@/lib/contact-rate-limit";

const validBody = {
  nombre: "Ana",
  apellido: "García",
  email: "ana@example.com",
  whatsapp: "",
  mensaje: "Hola, consulta.",
};

function makeRequest(body: unknown, ip = "203.0.113.50") {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    resetContactRateLimitMemoryForTests();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.CONTACT_EMAIL_TO = "inbox@example.com";
    process.env.CONTACT_RATE_LIMIT_MAX = "10";
    process.env.CONTACT_RATE_LIMIT_WINDOW_SEC = "900";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("responde 503 si falta configuración de email", async () => {
    delete process.env.RESEND_API_KEY;
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(503);
    const data = (await res.json()) as { error: string };
    expect(data.error).toBeDefined();
  });

  it("responde 400 con JSON inválido", async () => {
    const res = await POST(makeRequest("{not json", "203.0.113.51"));
    expect(res.status).toBe(400);
  });

  it("responde 400 con datos inválidos", async () => {
    const res = await POST(
      makeRequest({ ...validBody, email: "no-es-email" }, "203.0.113.52"),
    );
    expect(res.status).toBe(400);
  });

  it("responde 200 cuando el envío es correcto", async () => {
    const res = await POST(makeRequest(validBody, "203.0.113.53"));
    expect(res.status).toBe(200);
    const data = (await res.json()) as { ok: boolean };
    expect(data.ok).toBe(true);
  });

  it("responde 429 al superar el límite por IP", async () => {
    process.env.CONTACT_RATE_LIMIT_MAX = "2";
    const ip = "203.0.113.99";
    expect((await POST(makeRequest(validBody, ip))).status).toBe(200);
    expect((await POST(makeRequest(validBody, ip))).status).toBe(200);
    const res = await POST(makeRequest(validBody, ip));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
    const data = (await res.json()) as { error: string };
    expect(data.error).toMatch(/Demasiados envíos/i);
  });
});
