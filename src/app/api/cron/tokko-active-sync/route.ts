import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { isTokkoActive } from "@/lib/tokko";
import { buildPropertyIndexRow } from "@/lib/tokko-property-index";
import { requireCronAuth } from "@/lib/cron-auth";
import { getTokkoApiKey } from "@/lib/tokko-credentials";

const TOKKO_PAGE_SIZE = 50;

const tokkoObjectsSchema = z.object({
  objects: z.array(z.record(z.string(), z.unknown())).default([]),
});

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
  await sql`
    create table if not exists tokko_sync_logs (
      id bigserial primary key,
      started_at timestamptz not null,
      finished_at timestamptz not null,
      success boolean not null,
      pages_fetched integer not null default 0,
      active_count_remote integer not null default 0,
      added_count integer not null default 0,
      removed_count integer not null default 0,
      refreshed_count integer not null default 0,
      error_message text
    )
  `;
  await sql`
    create table if not exists tokko_property_index (
      property_id bigint primary key,
      slug text not null,
      title text not null,
      type text not null,
      operation text not null,
      location text not null,
      bedrooms integer not null default 0,
      bathrooms integer not null default 0,
      parking integer not null default 0,
      area numeric not null default 0,
      price_value numeric not null default 0,
      price_label text not null,
      main_image text not null default '',
      synced_at timestamptz not null default now()
    )
  `;
  await sql`create index if not exists idx_tokko_property_index_location on tokko_property_index (location)`;
  await sql`create index if not exists idx_tokko_property_index_type on tokko_property_index (type)`;
  await sql`create index if not exists idx_tokko_property_index_bedrooms on tokko_property_index (bedrooms)`;
  await sql`create index if not exists idx_tokko_property_index_price on tokko_property_index (price_value)`;
  await sql`create index if not exists idx_tokko_property_index_synced_at on tokko_property_index (synced_at desc)`;
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
  const authError = requireCronAuth(request);
  if (authError) {
    return authError;
  }

  const apiKey = getTokkoApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Falta TOKKO_API_KEY (solo servidor)" }, { status: 400 });
  }

  const startedAt = new Date();
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

    for (let index = 0; index < remoteIds.length; index += 1) {
      const id = remoteIds[index];
      const item = activeById.get(id);
      if (!item) {
        continue;
      }
      const raw = JSON.stringify(item);
      await sql`insert into tokko_active_properties (property_id, raw_json, synced_at) values (${id}, ${raw}::jsonb, now()) on conflict (property_id) do update set raw_json = excluded.raw_json, synced_at = now()`;
      const mapped = buildPropertyIndexRow(item, index + 1);
      if (!mapped) {
        continue;
      }
      await sql`
        insert into tokko_property_index (
          property_id, slug, title, type, operation, location, bedrooms, bathrooms, parking, area, price_value, price_label, main_image, synced_at
        ) values (
          ${mapped.propertyId}, ${mapped.slug}, ${mapped.title}, ${mapped.type}, ${mapped.operation}, ${mapped.location}, ${mapped.bedrooms},
          ${mapped.bathrooms}, ${mapped.parking}, ${mapped.area}, ${mapped.priceValue}, ${mapped.priceLabel}, ${mapped.mainImage}, now()
        )
        on conflict (property_id) do update set
          slug = excluded.slug,
          title = excluded.title,
          type = excluded.type,
          operation = excluded.operation,
          location = excluded.location,
          bedrooms = excluded.bedrooms,
          bathrooms = excluded.bathrooms,
          parking = excluded.parking,
          area = excluded.area,
          price_value = excluded.price_value,
          price_label = excluded.price_label,
          main_image = excluded.main_image,
          synced_at = now()
      `;
    }
    for (const id of toRemove) {
      await sql`delete from tokko_active_properties where property_id = ${id}`;
      await sql`delete from tokko_property_index where property_id = ${id}`;
      await sql`delete from featured_properties where property_id = ${id}`;
    }

    const finishedAt = new Date();
    const pagesFetched = Math.floor(offset / TOKKO_PAGE_SIZE) + 1;
    await sql`
      insert into tokko_sync_logs (
        started_at,
        finished_at,
        success,
        pages_fetched,
        active_count_remote,
        added_count,
        removed_count,
        refreshed_count,
        error_message
      ) values (
        ${startedAt.toISOString()}::timestamptz,
        ${finishedAt.toISOString()}::timestamptz,
        true,
        ${pagesFetched},
        ${remoteIds.length},
        ${toAdd.length},
        ${toRemove.length},
        ${toRefresh.length},
        null
      )
    `;

    return NextResponse.json(
      {
        ok: true,
        pagesFetched,
        activeCountRemote: remoteIds.length,
        added: toAdd.length,
        removed: toRemove.length,
        refreshed: toRefresh.length,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de sync";
    const finishedAt = new Date();
    try {
      await ensureTable();
      await sql`
        insert into tokko_sync_logs (
          started_at,
          finished_at,
          success,
          pages_fetched,
          active_count_remote,
          added_count,
          removed_count,
          refreshed_count,
          error_message
        ) values (
          ${startedAt.toISOString()}::timestamptz,
          ${finishedAt.toISOString()}::timestamptz,
          false,
          0,
          0,
          0,
          0,
          0,
          ${message}
        )
      `;
    } catch {}
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
