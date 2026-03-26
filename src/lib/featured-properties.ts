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
};

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toText(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export async function getFeaturedProperties(limit = 3): Promise<FeaturedProperty[]> {
  try {
    const rows = await sql`
      select property_id, slug, title, type, location, bedrooms, bathrooms, parking, area, price_label, main_image
      from tokko_property_index
      order by synced_at desc
      limit ${limit}
    `;

    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    return rows.map((row) => {
      const r = row as Record<string, unknown>;
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
      };
    });
  } catch {
    return [];
  }
}
