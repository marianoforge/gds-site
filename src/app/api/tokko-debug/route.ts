import { NextResponse } from "next/server";
import { z } from "zod";
import { getTokkoApiKey } from "@/lib/tokko-credentials";

const tokkoEnvelopeSchema = z.union([
  z.array(z.unknown()),
  z.object({}).passthrough(),
]);

const querySchema = z.object({
  resource: z.enum(["development", "property"]).default("property"),
  page: z.coerce.number().int().min(1).default(1),
  lang: z.enum(["es_ar", "en"]).default("es_ar"),
  format: z.enum(["json"]).default("json"),
});

type TokkoListResponse = {
  meta?: Record<string, unknown>;
  objects?: Array<Record<string, unknown>>;
};

const TOKKO_PAGE_SIZE = 50;

async function fetchTokkoJson({
  apiKey,
  resource,
  id,
  lang,
  format,
  limit,
  offset,
}: {
  apiKey: string;
  resource: "property" | "development";
  id?: number;
  lang: "es_ar" | "en";
  format: "json";
  limit?: number;
  offset?: number;
}) {
  const url = new URL(`https://www.tokkobroker.com/api/v1/${resource}/${id ? `${id}/` : ""}`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("lang", lang);
  url.searchParams.set("format", format);
  if (limit !== undefined) {
    url.searchParams.set("limit", String(limit));
  }
  if (offset !== undefined) {
    url.searchParams.set("offset", String(offset));
  }

  const res = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { raw: text };
  }
  return { res, parsed, url: url.toString() };
}

export async function GET(request: Request) {
  const apiKey = getTokkoApiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "Falta TOKKO_API_KEY (solo servidor)" }, { status: 400 });
  }

  const urlParams = new URL(request.url).searchParams;
  const parsedQuery = querySchema.safeParse({
    resource: urlParams.get("resource") ?? undefined,
    page: urlParams.get("page") ?? undefined,
    lang: urlParams.get("lang") ?? undefined,
    format: urlParams.get("format") ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const { resource, page, lang, format } = parsedQuery.data;
  const idParam = urlParams.get("id");
  const id = idParam && idParam.trim() !== "" ? Number(idParam) : undefined;

  if (idParam && (!Number.isInteger(id) || Number(id) <= 0)) {
    return NextResponse.json({ error: "El parámetro id debe ser un entero positivo" }, { status: 400 });
  }

  try {
    let sourceUsed = `https://www.tokkobroker.com/api/v1/${resource}/?limit=${TOKKO_PAGE_SIZE}&offset=${(page - 1) * TOKKO_PAGE_SIZE}`;
    let parsed: unknown;

    if (id) {
      const { res, parsed: singleParsed, url } = await fetchTokkoJson({
        apiKey,
        resource,
        id,
        lang,
        format,
      });
      sourceUsed = url;
      if (!res.ok) {
        return NextResponse.json(
          {
            error: "Tokko respondió con error",
            status: res.status,
            data: singleParsed,
          },
          { status: 502 },
        );
      }
      parsed = singleParsed;
    } else {
      const listResult = await fetchTokkoJson({
        apiKey,
        resource,
        limit: TOKKO_PAGE_SIZE,
        offset: (page - 1) * TOKKO_PAGE_SIZE,
        lang,
        format,
      });
      if (!listResult.res.ok) {
        return NextResponse.json(
          {
            error: "Tokko respondió con error",
            status: listResult.res.status,
            data: listResult.parsed,
          },
          { status: 502 },
        );
      }
      parsed = listResult.parsed;
      sourceUsed = listResult.url;
    }

    const validated = tokkoEnvelopeSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Formato JSON inesperado",
          data: parsed,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        source: sourceUsed,
        resource,
        page: id ? null : page,
        page_size: id ? null : TOKKO_PAGE_SIZE,
        id: id ?? null,
        data: validated.data,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "No se pudo conectar con Tokko" }, { status: 502 });
  }
}
