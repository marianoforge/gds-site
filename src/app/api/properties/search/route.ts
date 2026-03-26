import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { buildPropertyIndexRow } from "@/lib/tokko-property-index";

const querySchema = z.object({
  location: z.string().default("Todas las zonas"),
  type: z.string().default("Todos"),
  bedrooms: z.string().default("Cualquiera"),
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(24).default(12),
});

type PropertyItem = {
  propertyId: number;
  slug: string;
  image: string;
  title: string;
  price: string;
  type: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area: string;
};

function toNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value) || 0;
}

function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function applyFilters(
  items: PropertyItem[],
  locationFilter: string,
  typeFilter: string,
  bedrooms: string,
): PropertyItem[] {
  return items.filter((item) => {
    const byLocation =
      locationFilter === "" ||
      item.location.toLocaleLowerCase("es-AR").includes(locationFilter.toLocaleLowerCase("es-AR"));
    const byType =
      typeFilter === "" ||
      item.type.toLocaleLowerCase("es-AR").includes(typeFilter.toLocaleLowerCase("es-AR"));
    const byBedrooms =
      bedrooms === "Cualquiera" ||
      (bedrooms === "4+" ? item.bedrooms >= 4 : item.bedrooms === Number(bedrooms));
    return byLocation && byType && byBedrooms;
  });
}

async function triggerReindexInBackground(): Promise<void> {
  try {
    const rawRows = await sql`
      select property_id, raw_json
      from tokko_active_properties
      order by synced_at desc
      limit 10000
    `;
    const rawRowSchema = z.object({
      property_id: z.union([z.number().int(), z.string()]),
      raw_json: z.unknown(),
    });
    const parsed = z.array(rawRowSchema).safeParse(rawRows);
    if (!parsed.success) {
      return;
    }
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
    for (let index = 0; index < parsed.data.length; index += 1) {
      const row = parsed.data[index];
      if (!row.raw_json || typeof row.raw_json !== "object" || Array.isArray(row.raw_json)) {
        continue;
      }
      const mapped = buildPropertyIndexRow(row.raw_json as Record<string, unknown>, index + 1);
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
          slug = excluded.slug, title = excluded.title, type = excluded.type, operation = excluded.operation,
          location = excluded.location, bedrooms = excluded.bedrooms, bathrooms = excluded.bathrooms,
          parking = excluded.parking, area = excluded.area, price_value = excluded.price_value,
          price_label = excluded.price_label, main_image = excluded.main_image, synced_at = now()
      `;
    }
  } catch {
  }
}

async function getFallbackFromRaw(
  locationFilter: string,
  typeFilter: string,
  bedrooms: string,
  page: number,
  pageSize: number,
): Promise<{ items: PropertyItem[]; hasMore: boolean }> {
  const rawRows = await sql`
    select property_id, raw_json
    from tokko_active_properties
    order by synced_at desc
    limit 2000
  `;
  const rawRowSchema = z.object({
    property_id: z.union([z.number().int(), z.string()]),
    raw_json: z.unknown(),
  });
  const parsed = z.array(rawRowSchema).safeParse(rawRows);
  if (!parsed.success) {
    return { items: [], hasMore: false };
  }
  const allItems: PropertyItem[] = parsed.data
    .flatMap((row, index) => {
      if (!row.raw_json || typeof row.raw_json !== "object" || Array.isArray(row.raw_json)) {
        return [];
      }
      const mapped = buildPropertyIndexRow(row.raw_json as Record<string, unknown>, index + 1);
      if (!mapped) {
        return [];
      }
      const area = mapped.area;
      return [{
        propertyId: mapped.propertyId,
        slug: mapped.slug,
        image: mapped.mainImage || "/placeholder.svg",
        title: mapped.title,
        price: mapped.priceLabel,
        type: mapped.type,
        location: mapped.location,
        bedrooms: mapped.bedrooms,
        bathrooms: mapped.bathrooms,
        parking: mapped.parking,
        area: area > 0 ? `${area} m²` : "-",
      }];
    });
  const filtered = applyFilters(allItems, locationFilter, typeFilter, bedrooms);
  const offset = page * pageSize;
  const pageItems = filtered.slice(offset, offset + pageSize + 1);
  const hasMore = pageItems.length > pageSize;
  return { items: hasMore ? pageItems.slice(0, pageSize) : pageItems, hasMore };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    location: url.searchParams.get("location") ?? undefined,
    type: url.searchParams.get("type") ?? undefined,
    bedrooms: url.searchParams.get("bedrooms") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const { location, type, bedrooms, page, pageSize } = parsed.data;
  const locationFilter = location === "Todas las zonas" ? "" : location;
  const typeFilter = type === "Todos" ? "" : type;
  const bedroomCount = bedrooms === "Cualquiera" ? null : bedrooms === "4+" ? 4 : Number(bedrooms);
  const bedroomMode = bedrooms === "4+" ? "gte" : "eq";
  const offset = page * pageSize;

  try {
    const indexCountRows = await sql`select count(*)::int as total from tokko_property_index`.catch(() => []);
    const indexTotal =
      Array.isArray(indexCountRows) && indexCountRows.length > 0
        ? toNumber((indexCountRows[0] as Record<string, unknown>).total)
        : 0;

    if (indexTotal === 0) {
      void triggerReindexInBackground();
      const { items, hasMore } = await getFallbackFromRaw(locationFilter, typeFilter, bedrooms, page, pageSize);
      return NextResponse.json({ items, page, pageSize, hasMore, source: "raw" }, { status: 200 });
    }

    const rows = await sql`
      select property_id, slug, title, type, location, bedrooms, bathrooms, parking, area, price_label, main_image
      from tokko_property_index
      where (${locationFilter} = '' or location ilike ${`%${locationFilter}%`})
        and (${typeFilter} = '' or type ilike ${`%${typeFilter}%`})
        and (
          ${bedroomCount}::int is null
          or (${bedroomMode} = 'gte' and bedrooms >= ${bedroomCount ?? 0})
          or (${bedroomMode} = 'eq' and bedrooms = ${bedroomCount ?? 0})
        )
      order by synced_at desc
      limit ${pageSize + 1}
      offset ${offset}
    `;

    const mapped: PropertyItem[] = Array.isArray(rows)
      ? rows.map((row) => {
          const record = row as Record<string, unknown>;
          const area = toNumber(record.area);
          return {
            propertyId: toNumber(record.property_id),
            slug: toStringValue(record.slug),
            image: toStringValue(record.main_image) || "/placeholder.svg",
            title: toStringValue(record.title, "Propiedad"),
            price: toStringValue(record.price_label, "Consultar"),
            type: toStringValue(record.type, "Propiedad"),
            location: toStringValue(record.location, "Zona no informada"),
            bedrooms: toNumber(record.bedrooms),
            bathrooms: toNumber(record.bathrooms),
            parking: toNumber(record.parking),
            area: area > 0 ? `${area} m²` : "-",
          };
        })
      : [];

    const hasMore = mapped.length > pageSize;
    const items = hasMore ? mapped.slice(0, pageSize) : mapped;

    return NextResponse.json({ items, page, pageSize, hasMore, source: "index" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "No se pudieron obtener propiedades" }, { status: 500 });
  }
}
