import { NextResponse } from "next/server";

function isVercelProduction(): boolean {
  return process.env.VERCEL_ENV === "production";
}

export function requireCronAuth(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET?.trim();

  if (isVercelProduction() && !secret) {
    return NextResponse.json({ error: "CRON_SECRET no configurado" }, { status: 503 });
  }

  if (!secret) {
    return null;
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  return null;
}
