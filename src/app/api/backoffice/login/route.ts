import { NextResponse } from "next/server";
import { z } from "zod";
import {
  BACKOFFICE_SESSION_COOKIE,
  backofficeCookieMaxAge,
  createBackofficeSessionToken,
  hasBackofficeConfig,
  isBackofficeCredentialValid,
} from "@/lib/backoffice-auth";
import { tryConsumeBackofficeLoginSlot } from "@/lib/backoffice-rate-limit";

const bodySchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  if (!hasBackofficeConfig()) {
    return NextResponse.json({ error: "Backoffice no configurado" }, { status: 503 });
  }
  const rate = await tryConsumeBackofficeLoginSlot(request);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Probá más tarde." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSec) },
      },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (!isBackofficeCredentialValid(parsed.data.username, parsed.data.password)) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const token = await createBackofficeSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Backoffice no configurado" }, { status: 503 });
  }

  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set({
    name: BACKOFFICE_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: backofficeCookieMaxAge(),
  });
  return response;
}
