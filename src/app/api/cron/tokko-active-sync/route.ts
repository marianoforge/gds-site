import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { isTokkoActive } from "@/lib/tokko";

const TOKKO_PAGE_SIZE = 50;

const tokkoObjectsSchema = z.object({
  objects: z.array(z.record(z.string(), z.unknown())).default([]),
});

function getTokkoKey() {
  return process.env.TOKKO_API_KEY ?? process.env.NEXT_PUBLIC_TOKKO_API_KEY;
}

async function ensureTable() {
  await sql`
    create table if not exists tokko_active_properties (
      property_id bigint primary key,
      raw_json jsonb not null,
      synced_at timestamptz not null default now()
    )
  `;
  await sql`
    create table if not exists featured_properties (
      property_id bigint primary key,
      created_at timestamptz not null default now()
    )
  `;
}

async function fetchTokkoPage(apiKey: string, offset: number) {
  const url = new URL("https://www.tokkobroker.com/api/v1/property/");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("lang", "es_ar");
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(TOKKO_PAGE_SIZE));
  url.searchParams.set("offset", String(offset));

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Tokko respondió ${response.status}`);
  }
  const json = (await response.json()) as unknown;
  const parsed = tokkoObjectsSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Formato inesperado de Tokko");
  }
  return parsed.data.objects;
}

function toId(value: unknown): number | null {
  const id = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const apiKey = getTokkoKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Falta TOKKO_API_KEY o NEXT_PUBLIC_TOKKO_API_KEY" }, { status: 400 });
  }

  try {
    await ensureTable();

    const activeById = new Map<number, Record<string, unknown>>();
    let offset = 0;
    while (true) {
      const pageItems = await fetchTokkoPage(apiKey, offset);
      for (const item of pageItems) {
        const id = toId(item.id);
        if (!id) {
          continue;
        }
        if (!isTokkoActive(item)) {
          continue;
        }
        activeById.set(id, item);
      }
      if (pageItems.length < TOKKO_PAGE_SIZE) {
        break;
      }
      offset += TOKKO_PAGE_SIZE;
    }

    const dbRows = await sql`select property_id from tokko_active_properties`;
    const dbIds = z
      .array(z.object({ property_id: z.union([z.number().int(), z.string()]) }))
      .parse(dbRows)
      .map((row) => Number(row.property_id))
      .filter((id) => Number.isInteger(id) && id > 0);

    const dbSet = new Set(dbIds);
    const remoteIds = Array.from(activeById.keys());
    const remoteSet = new Set(remoteIds);

    const toAdd = remoteIds.filter((id) => !dbSet.has(id));
    const toRemove = dbIds.filter((id) => !remoteSet.has(id));
    const toRefresh = remoteIds.filter((id) => dbSet.has(id));

    for (const id of toAdd) {
      const raw = JSON.stringify(activeById.get(id));
      await sql`insert into tokko_active_properties (property_id, raw_json, synced_at) values (${id}, ${raw}::jsonb, now()) on conflict (property_id) do update set raw_json = excluded.raw_json, synced_at = now()`;
    }
    for (const id of toRefresh) {
      const raw = JSON.stringify(activeById.get(id));
      await sql`update tokko_active_properties set raw_json = ${raw}::jsonb, synced_at = now() where property_id = ${id}`;
    }
    for (const id of toRemove) {
      await sql`delete from tokko_active_properties where property_id = ${id}`;
      await sql`delete from featured_properties where property_id = ${id}`;
    }

    return NextResponse.json(
      {
        ok: true,
        pagesFetched: Math.floor(offset / TOKKO_PAGE_SIZE) + 1,
        activeCountRemote: remoteIds.length,
        added: toAdd.length,
        removed: toRemove.length,
        refreshed: toRefresh.length,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de sync";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
