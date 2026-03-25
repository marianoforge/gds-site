import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";

const rowSchema = z.object({
  property_id: z.union([z.number().int(), z.string()]),
  raw_json: z.unknown(),
});

export async function GET() {
  try {
    await sql`
      create table if not exists tokko_active_properties (
        property_id bigint primary key,
        raw_json jsonb not null,
        synced_at timestamptz not null default now()
      )
    `;
    const rows = await sql`
      select property_id, raw_json
      from tokko_active_properties
      order by synced_at desc
      limit 200
    `;
    const parsed = z.array(rowSchema).safeParse(rows);
    if (!parsed.success) {
      return NextResponse.json({ error: "Respuesta inválida de base de datos" }, { status: 502 });
    }
    const objects = parsed.data
      .map((row) => row.raw_json)
      .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
    return NextResponse.json({ data: { objects } }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "No se pudieron obtener propiedades activas" }, { status: 500 });
  }
}
