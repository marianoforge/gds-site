"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { readFeaturedPropertyIds, toggleFeaturedPropertyId, writeFeaturedPropertyIds } from "@/lib/featured-properties";

type TokkoResource = "property" | "development";

type TokkoResponse = {
  source: string;
  resource: TokkoResource;
  page?: number | null;
  page_size?: number | null;
  id?: number | null;
  data: unknown;
};

type TokkoItem = {
  id?: number;
  publication_title?: string;
  name?: string;
  reference_code?: string;
  address?: string;
  deleted_at?: string | null;
  status?: number | string | null;
  web_url?: string;
  location?: { full_location?: string; short_location?: string };
};
type TokkoRecord = TokkoItem & Record<string, unknown>;

function extractItems(payload: unknown): TokkoRecord[] {
  if (Array.isArray(payload)) {
    return payload as TokkoRecord[];
  }
  if (payload && typeof payload === "object" && "objects" in payload) {
    const objects = (payload as { objects?: unknown }).objects;
    if (Array.isArray(objects)) {
      return objects as TokkoRecord[];
    }
  }
  if (payload && typeof payload === "object" && "id" in payload) {
    return [payload as TokkoRecord];
  }
  return [];
}

type PropertyImage = {
  url: string;
  thumbUrl?: string;
  alt: string;
};

function isNonNull<T>(value: T | null): value is T {
  return value !== null;
}

function extractPropertyImages(item: TokkoRecord): PropertyImage[] {
  const candidates = [
    item.photos,
    item.images,
    item.pictures,
    item.attachments,
    item.multimedia,
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) {
      continue;
    }
    const images = candidate
      .map((entry, index) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }
        const data = entry as Record<string, unknown>;
        const urlFields = [
          data.image,
          data.url,
          data.original,
          data.large,
          data.medium,
          data.small,
          data.thumb,
          data.thumbnail,
        ];
        const url = urlFields.find((value) => typeof value === "string" && value.length > 0);
        if (!url || typeof url !== "string") {
          return null;
        }
        const thumbCandidate =
          (typeof data.thumb === "string" && data.thumb) ||
          (typeof data.thumbnail === "string" && data.thumbnail) ||
          (typeof data.small === "string" && data.small) ||
          undefined;
        return {
          url,
          thumbUrl: thumbCandidate,
          alt: typeof data.description === "string" && data.description.length > 0 ? data.description : `Imagen ${index + 1}`,
        } satisfies PropertyImage;
      })
      .filter(isNonNull);

    if (images.length > 0) {
      return images;
    }
  }

  return [];
}

export default function TokkoPage() {
  const [resource, setResource] = useState<TokkoResource>("property");
  const [idFilter, setIdFilter] = useState("");
  const [page, setPage] = useState(1);
  const [featuredIds, setFeaturedIds] = useState<number[]>([]);
  const [payload, setPayload] = useState<TokkoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allItems = useMemo(() => extractItems(payload?.data), [payload]);
  const items = allItems;
  const hasNextPage = useMemo(() => {
    if (idFilter.trim() || !payload || !payload.page_size) {
      return false;
    }
    return allItems.length >= payload.page_size;
  }, [allItems.length, idFilter, payload]);

  const loadListData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        resource,
        page: String(page),
        lang: "es_ar",
        format: "json",
      });
      const res = await fetch(`/api/tokko-debug?${params.toString()}`, { cache: "no-store" });
      const json = (await res.json()) as TokkoResponse | { error: string };
      if (!res.ok || "error" in json) {
        setPayload(null);
        setError("error" in json ? json.error : "No se pudo consultar Tokko");
        return;
      }
      setPayload(json);
    } catch {
      setPayload(null);
      setError("No se pudo consultar Tokko");
    } finally {
      setLoading(false);
    }
  }, [resource, page]);

  const loadById = useCallback(async () => {
    const id = idFilter.trim();
    if (!id) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        resource,
        lang: "es_ar",
        format: "json",
        id,
      });
      const res = await fetch(`/api/tokko-debug?${params.toString()}`, { cache: "no-store" });
      const json = (await res.json()) as TokkoResponse | { error: string };
      if (!res.ok || "error" in json) {
        setPayload(null);
        setError("error" in json ? json.error : "No se pudo consultar Tokko");
        return;
      }
      setPayload(json);
    } catch {
      setPayload(null);
      setError("No se pudo consultar Tokko");
    } finally {
      setLoading(false);
    }
  }, [resource, idFilter]);

  useEffect(() => {
    setFeaturedIds(readFeaturedPropertyIds());
  }, []);

  useEffect(() => {
    if (idFilter.trim()) {
      return;
    }
    void loadListData();
  }, [loadListData, idFilter]);

  const onToggleFeatured = useCallback((item: TokkoRecord) => {
    const id = typeof item.id === "number" ? item.id : Number(item.id);
    if (!Number.isInteger(id) || id <= 0) {
      return;
    }
    setFeaturedIds((prev) => {
      const next = toggleFeaturedPropertyId(prev, id);
      writeFeaturedPropertyIds(next);
      return next;
    });
  }, []);

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 lg:px-8 space-y-6">
        <div className="space-y-2">
          <p className="text-accent font-semibold tracking-[0.15em] uppercase text-sm">Tokko Explorer</p>
          <h1 className="text-3xl md:text-4xl font-bold">Listado de propiedades</h1>
          <p className="text-muted-foreground">
            Endpoint base de schema: https://www.tokkobroker.com/api/v1/development/
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Opciones</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">Recurso</span>
              <select
                className="h-10 rounded-md border bg-background px-3"
                value={resource}
                onChange={(e) => {
                  setResource(e.target.value as TokkoResource);
                  setPage(1);
                }}
              >
                <option value="property">/api/v1/property/</option>
                <option value="development">/api/v1/development/</option>
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">ID (opcional)</span>
              <input
                type="number"
                className="h-10 w-36 rounded-md border bg-background px-3"
                min={1}
                placeholder="Ej: 44833"
                value={idFilter}
                onChange={(e) => {
                  setIdFilter(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <Button onClick={() => void loadById()} disabled={loading || !idFilter.trim()}>
              {loading ? "Cargando..." : "Consultar ID"}
            </Button>
            {!idFilter.trim() ? (
              <div className="ml-auto flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1 || loading}
                >
                  Anterior
                </Button>
                <Badge variant="outline">Página {page}</Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={loading || !hasNextPage}
                >
                  Siguiente
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <CardTitle>Resultados</CardTitle>
              {payload ? <Badge variant="secondary">{payload.resource}</Badge> : null}
              {payload ? <Badge variant="outline">{items.length} items</Badge> : null}
              {payload?.id ? <Badge variant="outline">id: {payload.id}</Badge> : null}
              {payload?.page ? <Badge variant="outline">page: {payload.page}</Badge> : null}
              {payload?.page_size ? <Badge variant="outline">page_size: {payload.page_size}</Badge> : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="rounded-lg border bg-secondary/40 px-4 py-3">
              <p className="text-sm text-muted-foreground">Total general</p>
              <p className="text-3xl font-bold leading-none">{allItems.length}</p>
              <p className="mt-3 text-sm text-muted-foreground">Destacadas configuradas en el sitio</p>
              <p className="text-2xl font-semibold leading-none">{featuredIds.length}</p>
            </div>

            {items.map((item, index) => (
              <article key={`${item.id ?? item.reference_code ?? item.name ?? index}`} className="rounded-lg border p-4">
                <h2 className="font-semibold text-lg">{item.publication_title ?? item.name ?? "Sin título"}</h2>
                <p className="text-sm text-muted-foreground">
                  {item.reference_code ? `Ref: ${item.reference_code} · ` : ""}
                  {item.address ?? "-"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.location?.full_location ?? item.location?.short_location ?? "-"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Status: {item.status ?? "-"} {item.deleted_at ? `· deleted_at: ${item.deleted_at}` : ""}
                </p>
                <label className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={featuredIds.includes(typeof item.id === "number" ? item.id : Number(item.id))}
                    onChange={() => onToggleFeatured(item)}
                    disabled={!Number.isInteger(typeof item.id === "number" ? item.id : Number(item.id))}
                  />
                  Destacar en home
                </label>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {item.web_url ? (
                    <a className="text-sm text-primary underline" href={item.web_url} target="_blank" rel="noreferrer">
                      Ver URL
                    </a>
                  ) : null}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        Ver data completa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl">
                      <DialogHeader>
                        <DialogTitle>
                          {item.publication_title ?? item.name ?? "Detalle"} {item.id ? `#${item.id}` : ""}
                        </DialogTitle>
                      </DialogHeader>
                      {(() => {
                        const propertyImages = extractPropertyImages(item);
                        if (propertyImages.length === 0) {
                          return null;
                        }
                        return (
                          <details className="rounded-lg border bg-secondary/40 p-3" open>
                            <summary className="cursor-pointer text-sm font-medium">
                              Imágenes de la propiedad ({propertyImages.length})
                            </summary>
                            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                              {propertyImages.map((image, imageIndex) => (
                                <a
                                  key={`${image.url}-${imageIndex}`}
                                  href={image.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="shrink-0"
                                >
                                  <img
                                    src={image.thumbUrl ?? image.url}
                                    alt={image.alt}
                                    className="h-28 w-40 rounded-md border object-cover"
                                    loading="lazy"
                                  />
                                </a>
                              ))}
                            </div>
                          </details>
                        );
                      })()}
                      <pre className="max-h-[70vh] overflow-auto rounded-lg border bg-secondary p-4 text-xs leading-5">
                        {JSON.stringify(item, null, 2)}
                      </pre>
                    </DialogContent>
                  </Dialog>
                </div>
              </article>
            ))}

            <details>
              <summary className="cursor-pointer text-sm text-muted-foreground">Ver raw JSON</summary>
              <pre className="mt-3 max-h-[420px] overflow-auto rounded-lg border bg-secondary p-4 text-xs leading-5">
                {JSON.stringify(payload?.data ?? null, null, 2)}
              </pre>
            </details>

            <p className="text-xs text-muted-foreground break-all">
              Source: {payload?.source ?? "-"}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
