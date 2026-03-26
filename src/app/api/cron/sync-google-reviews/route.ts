import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ensureGoogleReviewsTable, fetchFromGoogleApi } from "@/lib/google-reviews";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await ensureGoogleReviewsTable();

    const reviews = await fetchFromGoogleApi();
    if (reviews.length === 0) {
      return NextResponse.json({ ok: true, upserted: 0, message: "Sin reviews de Google" });
    }

    let upserted = 0;
    for (const review of reviews) {
      if (!review.text || !review.authorName || review.time === 0) {
        continue;
      }
      const result = await sql`
        insert into google_reviews (author_name, author_photo, rating, text, review_time, relative_time, synced_at)
        values (
          ${review.authorName},
          ${review.authorPhoto},
          ${review.rating},
          ${review.text},
          ${review.time},
          ${review.relativeTime},
          now()
        )
        on conflict (author_name, review_time) do update set
          author_photo  = excluded.author_photo,
          relative_time = excluded.relative_time,
          synced_at     = now()
        returning id
      `;
      if (Array.isArray(result) && result.length > 0) {
        upserted += 1;
      }
    }

    const totalRows = await sql`select count(*)::int as total from google_reviews`;
    const total =
      Array.isArray(totalRows) && totalRows.length > 0
        ? Number((totalRows[0] as Record<string, unknown>).total)
        : 0;

    return NextResponse.json({ ok: true, upserted, totalAccumulated: total });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
