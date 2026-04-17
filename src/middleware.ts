import { NextRequest, NextResponse } from "next/server";
import {
  BACKOFFICE_SESSION_COOKIE,
  hasBackofficeConfig,
  isBackofficeSessionValid,
} from "@/lib/backoffice-auth";

function unauthorizedApiResponse() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isApiRoute = pathname.startsWith("/api/");

  if (!hasBackofficeConfig()) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Backoffice no configurado" }, { status: 503 });
    }
    const loginUrl = new URL("/backoffice/login", request.url);
    loginUrl.searchParams.set("error", "config");
    loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const token = request.cookies.get(BACKOFFICE_SESSION_COOKIE)?.value;
  const isValid = await isBackofficeSessionValid(token);
  if (isValid) {
    return NextResponse.next();
  }

  if (isApiRoute) {
    return unauthorizedApiResponse();
  }

  const loginUrl = new URL("/backoffice/login", request.url);
  loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/tokko",
    "/api/featured-properties",
    "/api/tokko-debug",
    "/api/cron/tokko-active-sync/logs",
    "/api/admin/:path*",
  ],
};
