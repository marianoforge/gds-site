import { afterEach, describe, expect, it, vi } from "vitest";
import {
  hasCronBearer,
  requireCronAuth,
  requireCronOrBackofficeAuth,
} from "./cron-auth";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("hasCronBearer", () => {
  it("acepta el bearer del CRON_SECRET", () => {
    vi.stubEnv("CRON_SECRET", "test-secret");
    const request = new Request("https://example.com", {
      headers: { authorization: "Bearer test-secret" },
    });
    expect(hasCronBearer(request)).toBe(true);
  });

  it("rechaza un bearer incorrecto", () => {
    vi.stubEnv("CRON_SECRET", "test-secret");
    const request = new Request("https://example.com", {
      headers: { authorization: "Bearer wrong" },
    });
    expect(hasCronBearer(request)).toBe(false);
  });
});

describe("requireCronOrBackofficeAuth", () => {
  it("delega al cron auth si hay Bearer", async () => {
    vi.stubEnv("CRON_SECRET", "test-secret");
    vi.stubEnv("VERCEL_ENV", "production");
    const request = new Request("https://example.com", {
      headers: { authorization: "Bearer wrong" },
    });
    const response = requireCronOrBackofficeAuth(request);
    expect(response?.status).toBe(401);
  });

  it("permite requests sin Bearer (sesión backoffice vía middleware)", () => {
    vi.stubEnv("CRON_SECRET", "test-secret");
    const request = new Request("https://example.com");
    expect(requireCronOrBackofficeAuth(request)).toBeNull();
  });

  it("requireCronAuth sigue exigiendo bearer cuando hay secret", () => {
    vi.stubEnv("CRON_SECRET", "test-secret");
    const request = new Request("https://example.com");
    expect(requireCronAuth(request)?.status).toBe(401);
  });
});
