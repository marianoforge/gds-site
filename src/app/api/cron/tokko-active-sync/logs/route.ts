import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { requireCronAuth } from "@/lib/cron-auth";

const logRowSchema = z.object({
  id: z.union([z.number().int(), z.string()]),
  started_at: z.string(),
  finished_at: z.string(),
  success: z.boolean(),
  pages_fetched: z.union([z.number().int(), z.string()]),
  active_count_remote: z.union([z.number().int(), z.string()]),
  added_count: z.union([z.number().int(), z.string()]),
  removed_count: z.union([z.number().int(), z.string()]),
  refreshed_count: z.union([z.number().int(), z.string()]),
  error_message: z.string().nullable(),
});

export async function GET(request: Request) {
  const authError = requireCronAuth(request);
  if (authError) {
    return authError;
  }

  try {
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
    const searchParams = new URL(request.url).searchParams;
    const limitParam = Number(searchParams.get("limit") ?? "20");
    const limit = Number.isInteger(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 20;

    const rows = await sql`
      select
        id,
        started_at::text as started_at,
        finished_at::text as finished_at,
        success,
        pages_fetched,
        active_count_remote,
        added_count,
        removed_count,
        refreshed_count,
        error_message
      from tokko_sync_logs
      order by started_at desc
      limit ${limit}
    `;
    const parsed = z.array(logRowSchema).safeParse(rows);
    if (!parsed.success) {
      return NextResponse.json({ error: "Formato inválido de logs" }, { status: 502 });
    }

    const logs = parsed.data.map((row) => ({
      id: Number(row.id),
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      success: row.success,
      pagesFetched: Number(row.pages_fetched),
      activeCountRemote: Number(row.active_count_remote),
      added: Number(row.added_count),
      removed: Number(row.removed_count),
      refreshed: Number(row.refreshed_count),
      error: row.error_message,
    }));

    return NextResponse.json({ logs }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "No se pudieron obtener logs del cron" }, { status: 500 });
  }
}
