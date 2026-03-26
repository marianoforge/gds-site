import { sql } from "@/lib/db";

export type FeaturedProperty = {
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
  isFeatured: boolean;
};

function toNumber(value: unknown): number {
  if (typeof value === "bigint") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toText(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function mapRow(r: Record<string, unknown>, isFeatured: boolean): FeaturedProperty {
  const area = toNumber(r.area);
  return {
    propertyId: toNumber(r.property_id),
    slug: toText(r.slug),
    image: toText(r.main_image) || "/placeholder.svg",
    title: toText(r.title, "Propiedad"),
    price: toText(r.price_label, "Consultar"),
    type: toText(r.type, "Propiedad"),
    location: toText(r.location, ""),
    bedrooms: toNumber(r.bedrooms),
    bathrooms: toNumber(r.bathrooms),
    parking: toNumber(r.parking),
    area: area > 0 ? `${area} m²` : "-",
    isFeatured,
  };
}

export async function getFeaturedProperties(limit = 3): Promise<FeaturedProperty[]> {
  try {
    const idRows = await sql`select property_id from featured_properties`;
    const featuredSet = new Set<number>();
    if (Array.isArray(idRows)) {
      for (const row of idRows) {
        const pid = toNumber((row as Record<string, unknown>).property_id);
        if (pid > 0) featuredSet.add(pid);
      }
    }

    const featuredRows = await sql`
      select
        i.property_id,
        i.slug,
        i.title,
        i.type,
        i.location,
        i.bedrooms,
        i.bathrooms,
        i.parking,
        i.area,
        i.price_label,
        i.main_image
      from tokko_property_index i
      inner join featured_properties f on f.property_id = i.property_id
      order by f.created_at desc
      limit ${limit}
    `;

    const out: FeaturedProperty[] = [];
    if (Array.isArray(featuredRows)) {
      for (const row of featuredRows) {
        out.push(mapRow(row as Record<string, unknown>, true));
      }
    }

    if (out.length >= limit) {
      return out.slice(0, limit);
    }

    const skipIds = out.map((p) => p.propertyId);
    const need = limit - out.length;

    const filler =
      skipIds.length === 0
        ? await sql`
            select
              property_id, slug, title, type, location, bedrooms, bathrooms, parking, area, price_label, main_image
            from tokko_property_index
            order by synced_at desc
            limit ${need}
          `
        : await sql`
            select
              property_id, slug, title, type, location, bedrooms, bathrooms, parking, area, price_label, main_image
            from tokko_property_index
            where not (property_id = any(${skipIds}::bigint[]))
            order by synced_at desc
            limit ${need}
          `;

    if (Array.isArray(filler)) {
      for (const row of filler) {
        const r = row as Record<string, unknown>;
        const pid = toNumber(r.property_id);
        if (pid > 0) {
          out.push(mapRow(r, featuredSet.has(pid)));
        }
      }
    }

    return out.slice(0, limit);
  } catch {
    return [];
  }
}
