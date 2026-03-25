import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";

const healthRowSchema = z.object({
  ok: z.number().int(),
  now: z.string(),
});

export async function GET() {
  try {
    const result = await sql`select 1 as ok, now()::text as now`;
    const parsed = z.array(healthRowSchema).safeParse(result);

    if (!parsed.success || parsed.data.length === 0) {
      return NextResponse.json({ ok: false, error: "Respuesta de base de datos inválida" }, { status: 502 });
    }

    return NextResponse.json(
      {
        ok: true,
        db: "neon",
        data: parsed.data[0],
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "No se pudo conectar a la base de datos" }, { status: 502 });
  }
}
