import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { isTokkoActive } from "@/lib/tokko";
import { requireCronAuth } from "@/lib/cron-auth";
import { getTokkoApiKey } from "@/lib/tokko-credentials";

const TOKKO_PAGE_SIZE = 50;

const tokkoObjectsSchema = z.object({
  objects: z.array(z.record(z.string(), z.unknown())).default([]),
});

async function fetchAllTokkoIds(apiKey: string): Promise<Map<number, { active: boolean; deleted_at: unknown; status: unknown }>> {
  const result = new Map<number, { active: boolean; deleted_at: unknown; status: unknown }>();
  let offset = 0;

  while (true) {
    const url = new URL("https://www.tokkobroker.com/api/v1/property/");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("lang", "es_ar");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", String(TOKKO_PAGE_SIZE));
    url.searchParams.set("offset", String(offset));

    const res = await fetch(url.toString(), { method: "GET", cache: "no-store", headers: { Accept: "application/json" } });
    if (!res.ok) {
      throw new Error(`Tokko respondió ${res.status} en offset ${offset}`);
    }
    const json = (await res.json()) as unknown;
    const parsed = tokkoObjectsSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error("Formato inesperado de Tokko");
    }

    for (const item of parsed.data.objects) {
      const id = typeof item.id === "number" ? item.id : Number(item.id);
      if (!Number.isInteger(id) || id <= 0) {
        continue;
      }
      result.set(id, {
        active: isTokkoActive(item),
        deleted_at: item.deleted_at,
        status: item.status,
      });
    }

    if (parsed.data.objects.length < TOKKO_PAGE_SIZE) {
      break;
    }
    offset += TOKKO_PAGE_SIZE;
  }

  return result;
}

export async function GET(request: Request) {
  const authError = requireCronAuth(request);
  if (authError) {
    return authError;
  }

  const apiKey = getTokkoApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Falta TOKKO_API_KEY (solo servidor)" }, { status: 400 });
  }

  try {
    const tokkoMap = await fetchAllTokkoIds(apiKey);

    const tokkoActiveIds = new Set(
      Array.from(tokkoMap.entries())
        .filter(([, v]) => v.active)
        .map(([id]) => id),
    );

    const dbRows = await sql`select property_id from tokko_active_properties`.catch(() => []);
    const dbIds = z
      .array(z.object({ property_id: z.union([z.number().int(), z.string()]) }))
      .parse(dbRows)
      .map((r) => Number(r.property_id))
      .filter((id) => Number.isInteger(id) && id > 0);
    const dbSet = new Set(dbIds);

    const inTokkoNotInDb = Array.from(tokkoActiveIds)
      .filter((id) => !dbSet.has(id))
      .map((id) => ({
        id,
        deleted_at: tokkoMap.get(id)?.deleted_at ?? null,
        status: tokkoMap.get(id)?.status ?? null,
      }));

    const inDbNotInTokkoActive = dbIds.filter((id) => !tokkoActiveIds.has(id));

    return NextResponse.json({
      tokkoTotal: tokkoMap.size,
      tokkoActiveTotal: tokkoActiveIds.size,
      dbTotal: dbIds.length,
      missingInDb: inTokkoNotInDb.length,
      extraInDb: inDbNotInTokkoActive.length,
      inTokkoNotInDb,
      inDbNotInTokkoActive,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
