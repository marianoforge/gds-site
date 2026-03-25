import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";

const bodySchema = z.object({
  propertyId: z.number().int().positive(),
  featured: z.boolean(),
});

async function ensureTable() {
  await sql`
    create table if not exists featured_properties (
      property_id bigint primary key,
      created_at timestamptz not null default now()
    )
  `;
}

export async function GET() {
  try {
    await ensureTable();
    const rows = await sql`select property_id from featured_properties order by created_at desc`;
    const ids = z
      .array(z.object({ property_id: z.union([z.number().int(), z.string()]) }))
      .parse(rows)
      .map((row) => Number(row.property_id))
      .filter((id) => Number.isInteger(id) && id > 0);
    return NextResponse.json({ ids }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "No se pudieron obtener las destacadas" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureTable();
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }
    const { propertyId, featured } = parsed.data;
    if (featured) {
      await sql`insert into featured_properties (property_id) values (${propertyId}) on conflict (property_id) do nothing`;
    } else {
      await sql`delete from featured_properties where property_id = ${propertyId}`;
    }
    const rows = await sql`select property_id from featured_properties order by created_at desc`;
    const ids = z
      .array(z.object({ property_id: z.union([z.number().int(), z.string()]) }))
      .parse(rows)
      .map((row) => Number(row.property_id))
      .filter((id) => Number.isInteger(id) && id > 0);
    return NextResponse.json({ ids }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar la destacada" }, { status: 500 });
  }
}
