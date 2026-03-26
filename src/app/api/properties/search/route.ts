import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";

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

    return NextResponse.json(
      {
        items,
        page,
        pageSize,
        hasMore,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "No se pudieron obtener propiedades" }, { status: 500 });
  }
}
