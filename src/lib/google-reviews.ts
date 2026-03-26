import { sql } from "@/lib/db";

export type GoogleReview = {
  authorName: string;
  authorPhoto: string;
  rating: number;
  text: string;
  relativeTime: string;
  time: number;
};

export type GooglePlaceReviews = {
  placeId: string;
  name: string;
  rating: number;
  totalReviews: number;
  reviews: GoogleReview[];
};

export async function ensureGoogleReviewsTable(): Promise<void> {
  await sql`
    create table if not exists google_reviews (
      id bigserial primary key,
      author_name text not null,
      author_photo text not null default '',
      rating integer not null,
      text text not null,
      review_time bigint not null,
      relative_time text not null default '',
      synced_at timestamptz not null default now(),
      unique (author_name, review_time)
    )
  `;
}

export async function fetchFromGoogleApi(): Promise<GoogleReview[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return [];
  }

  const fields = ["name", "rating", "user_ratings_total", "reviews"].join(",");
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=es&reviews_sort=newest&key=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 60 * 60 * 6 } });
  if (!res.ok) {
    return [];
  }

  const data = (await res.json()) as {
    status: string;
    result?: {
      reviews?: Array<{
        author_name?: string;
        profile_photo_url?: string;
        rating?: number;
        text?: string;
        relative_time_description?: string;
        time?: number;
      }>;
    };
  };

  if (data.status !== "OK" || !data.result?.reviews) {
    return [];
  }

  return data.result.reviews.map((r) => ({
    authorName: r.author_name ?? "Cliente",
    authorPhoto: r.profile_photo_url ?? "",
    rating: r.rating ?? 5,
    text: r.text ?? "",
    relativeTime: r.relative_time_description ?? "",
    time: r.time ?? 0,
  }));
}

export async function getGoogleReviews(): Promise<GooglePlaceReviews | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return null;
  }

  try {
    await ensureGoogleReviewsTable();

    const dbRows = await sql`
      select author_name, author_photo, rating, text, review_time, relative_time
      from google_reviews
      order by random()
      limit 10
    `;

    let reviews: GoogleReview[] = [];

    if (Array.isArray(dbRows) && dbRows.length > 0) {
      reviews = dbRows.map((row) => {
        const r = row as Record<string, unknown>;
        return {
          authorName: String(r.author_name ?? "Cliente"),
          authorPhoto: String(r.author_photo ?? ""),
          rating: Number(r.rating ?? 5),
          text: String(r.text ?? ""),
          relativeTime: String(r.relative_time ?? ""),
          time: Number(r.review_time ?? 0),
        };
      });
    } else {
      reviews = await fetchFromGoogleApi();
    }

    return {
      placeId,
      name: "Gustavo De Simone Soluciones Inmobiliarias",
      rating: 5,
      totalReviews: 149,
      reviews,
    };
  } catch {
    return null;
  }
}
