import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { buildPropertyIndexRow } from "@/lib/tokko-property-index";

const rawRowSchema = z.object({
  property_id: z.union([z.number().int(), z.string()]),
  raw_json: z.unknown(),
});

async function ensureIndexTable() {
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

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await ensureIndexTable();
    const rawRows = await sql`
      select property_id, raw_json
      from tokko_active_properties
      order by synced_at desc
      limit 10000
    `;
    const parsed = z.array(rawRowSchema).safeParse(rawRows);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos en tokko_active_properties" }, { status: 500 });
    }

    let upserted = 0;
    let skipped = 0;

    for (let index = 0; index < parsed.data.length; index += 1) {
      const row = parsed.data[index];
      if (!row.raw_json || typeof row.raw_json !== "object" || Array.isArray(row.raw_json)) {
        skipped += 1;
        continue;
      }
      const mapped = buildPropertyIndexRow(row.raw_json as Record<string, unknown>, index + 1);
      if (!mapped) {
        skipped += 1;
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
      upserted += 1;
    }

    await sql`
      delete from tokko_property_index i
      where not exists (
        select 1
        from tokko_active_properties p
        where p.property_id = i.property_id
      )
    `;

    const totalRows = await sql`select count(*)::int as total from tokko_property_index`;
    const total =
      Array.isArray(totalRows) && totalRows.length > 0
        ? Number((totalRows[0] as Record<string, unknown>).total) || 0
        : 0;

    return NextResponse.json(
      {
        ok: true,
        sourceRows: parsed.data.length,
        upserted,
        skipped,
        totalIndexed: total,
      },
      { status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo reindexar";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
