import { z } from "zod";
import { cache } from "react";
import { sql } from "@/lib/db";

const tokkoPropertySchema = z.object({}).passthrough();

type TokkoPropertyRecord = z.infer<typeof tokkoPropertySchema>;

const dbRowSchema = z.object({
  property_id: z.union([z.number().int(), z.string()]),
  raw_json: z.unknown(),
});

function parsePropertyIdFromSlug(slug: string): number | null {
  const trimmed = slug.trim();
  const match = trimmed.match(/^(\d+)/);
  if (!match) {
    return null;
  }
  const id = Number(match[1]);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

async function readPropertyFromDb(id: number): Promise<TokkoPropertyRecord | null> {
  try {
    const rows = await sql`
      select property_id, raw_json
      from tokko_active_properties
      where property_id = ${id}
      limit 1
    `;
    const parsedRows = z.array(dbRowSchema).safeParse(rows);
    if (!parsedRows.success || parsedRows.data.length === 0) {
      return null;
    }
    const raw = parsedRows.data[0].raw_json;
    const parsedProperty = tokkoPropertySchema.safeParse(raw);
    if (!parsedProperty.success) {
      return null;
    }
    return parsedProperty.data;
  } catch {
    return null;
  }
}

export async function getPropertyBySlug(slug: string): Promise<TokkoPropertyRecord | null> {
  const id = parsePropertyIdFromSlug(slug);
  if (!id) {
    return null;
  }
  return readPropertyFromDb(id);
}

export async function getRelatedProperties(
  currentPropertyId: number,
  limit: number,
): Promise<TokkoPropertyRecord[]> {
  try {
    const rows = await sql`
      select p.property_id, p.raw_json
      from tokko_active_properties p
      join tokko_property_index i on i.property_id = p.property_id
      where p.property_id <> ${currentPropertyId}
      order by i.synced_at desc
      limit ${limit}
    `;
    const parsed = z.array(dbRowSchema).safeParse(rows);
    if (!parsed.success) {
      return [];
    }
    return parsed.data
      .map((row) => tokkoPropertySchema.safeParse(row.raw_json))
      .flatMap((item) => (item.success ? [item.data] : []));
  } catch {
    return [];
  }
}

export function parsePropertyId(slug: string): number | null {
  return parsePropertyIdFromSlug(slug);
}

export const getPropertyBySlugCached = cache(getPropertyBySlug);
export const getRelatedPropertiesCached = cache(getRelatedProperties);
