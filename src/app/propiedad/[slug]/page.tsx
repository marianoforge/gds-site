import Link from "next/link";
import { notFound } from "next/navigation";
import { Bath, BedDouble, Car, MapPin, Maximize } from "lucide-react";
import { getPropertyBySlugCached, getRelatedPropertiesCached, parsePropertyId } from "@/lib/property-details";
import PropertyGallery from "@/components/PropertyGallery";
import { siteImages } from "@/lib/site-media";

type UnknownRecord = Record<string, unknown>;

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toTitleCase(value: string): string {
  return value
    .toLocaleLowerCase("es-AR")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("es-AR") + part.slice(1))
    .join(" ");
}

function getPhotoUrls(property: UnknownRecord): string[] {
  const photos = Array.isArray(property.photos) ? property.photos : [];
  const urls = photos
    .map((photo) => {
      if (!photo || typeof photo !== "object") {
        return "";
      }
      const p = photo as UnknownRecord;
      return (
        toText(p.original) ||
        toText(p.image) ||
        toText(p.large) ||
        toText(p.medium) ||
        toText(p.small) ||
        toText(p.url)
      );
    })
    .filter(Boolean);
  return urls.length > 0 ? urls : [siteImages.property1];
}

function getPrice(property: UnknownRecord): string {
  const operations = Array.isArray(property.operations) ? property.operations : [];
  const firstOp = operations[0] && typeof operations[0] === "object" ? (operations[0] as UnknownRecord) : null;
  const prices = firstOp && Array.isArray(firstOp.prices) ? firstOp.prices : [];
  const firstPrice = prices[0] && typeof prices[0] === "object" ? (prices[0] as UnknownRecord) : null;
  const amount = toNumber(firstPrice?.price);
  if (amount <= 0) {
    return "Consultar";
  }
  const currency = toText(firstPrice?.currency).toUpperCase() || "USD";
  const formatter = new Intl.NumberFormat("es-AR");
  const symbol = currency === "USD" ? "U$S" : currency;
  return `${symbol} ${formatter.format(amount)}`;
}

function getTitle(property: UnknownRecord): string {
  const title = toText(property.publication_title) || toText(property.title) || "Propiedad";
  return toTitleCase(title);
}

function getType(property: UnknownRecord): string {
  const typeName =
    toText((property.type as UnknownRecord | undefined)?.name) ||
    toText((property.subtype as UnknownRecord | undefined)?.name) ||
    "Propiedad";
  return toTitleCase(typeName);
}

function getOperation(property: UnknownRecord): string {
  const operations = Array.isArray(property.operations) ? property.operations : [];
  const firstOp = operations[0] && typeof operations[0] === "object" ? (operations[0] as UnknownRecord) : null;
  return toTitleCase(toText(firstOp?.operation_type) || "Venta");
}

function getDescription(property: UnknownRecord): string[] {
  const raw =
    toText(property.description) ||
    toText(property.rich_description) ||
    toText(property.publication_description);
  if (!raw) {
    return [];
  }
  return raw
    .split(/\n{2,}|\r\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getFeatureList(property: UnknownRecord): string[] {
  const directFeatures = Array.isArray(property.features) ? property.features : [];
  const fromFeatures = directFeatures
    .map((item) => {
      if (typeof item === "string") {
        return toTitleCase(item);
      }
      if (item && typeof item === "object") {
        const objectItem = item as UnknownRecord;
        return toTitleCase(toText(objectItem.name) || toText(objectItem.value));
      }
      return "";
    })
    .filter(Boolean);
  const tags = Array.isArray(property.tags) ? property.tags : [];
  const fromTags = tags
    .map((item) => {
      if (typeof item === "string") {
        return toTitleCase(item);
      }
      if (item && typeof item === "object") {
        return toTitleCase(toText((item as UnknownRecord).name));
      }
      return "";
    })
    .filter(Boolean);
  const all = [...fromFeatures, ...fromTags];
  return Array.from(new Set(all)).slice(0, 30);
}

function getAddress(property: UnknownRecord): {
  address: string;
  location: string;
  city: string;
  neighborhood: string;
  state: string;
  country: string;
} {
  const location = (property.location && typeof property.location === "object"
    ? (property.location as UnknownRecord)
    : {}) as UnknownRecord;
  return {
    address: toText(property.address) || "Dirección a consultar",
    location: toText(location.name) || "Zona no informada",
    city: toText(location.short_location) || toText(location.full_location) || "-",
    neighborhood: toText(location.short_location) || toText(location.name) || "-",
    state: toText(location.state) || "-",
    country: toText(location.country) || "-",
  };
}

function getCoordinates(property: UnknownRecord): { lat: number; lng: number } | null {
  const candidates: Array<{ lat: unknown; lng: unknown }> = [
    { lat: property.geo_lat, lng: property.geo_long },
    { lat: property.geo_lat, lng: property.geo_lng },
    { lat: property.latitude, lng: property.longitude },
    { lat: property.lat, lng: property.lng },
    {
      lat: (property.location as UnknownRecord | undefined)?.lat,
      lng: (property.location as UnknownRecord | undefined)?.lng,
    },
    {
      lat: (property.location as UnknownRecord | undefined)?.latitude,
      lng: (property.location as UnknownRecord | undefined)?.longitude,
    },
  ];
  for (const candidate of candidates) {
    const lat = toNumber(candidate.lat);
    const lng = toNumber(candidate.lng);
    if (lat !== 0 && lng !== 0) {
      return { lat, lng };
    }
  }
  return null;
}

function getStats(property: UnknownRecord) {
  const bedrooms = toNumber(property.bedroom_amount || property.room_amount || property.suite_amount);
  const bathrooms = toNumber(property.bathroom_amount || property.bathrooms);
  const parkingRaw =
    typeof property.garage === "boolean"
      ? property.garage
        ? 1
        : 0
      : property.garage || property.parking_lot_amount;
  const parking = toNumber(parkingRaw);
  const covered = toNumber(property.roofed_surface || property.surface);
  const total = toNumber(property.total_surface || property.surface || property.roofed_surface);
  const rooms = toNumber(property.room_amount);
  return { bedrooms, bathrooms, parking, covered, total, rooms };
}

function getPublishedAt(property: UnknownRecord): string {
  const raw = toText(property.updated_at) || toText(property.publication_date) || "";
  if (!raw) {
    return "";
  }
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function buildOpenStreetMapEmbed(coordinates: { lat: number; lng: number }): string {
  const delta = 0.005;
  const left = coordinates.lng - delta;
  const right = coordinates.lng + delta;
  const top = coordinates.lat + delta;
  const bottom = coordinates.lat - delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`;
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const propertyId = parsePropertyId(slug);
  if (!propertyId) {
    notFound();
  }
  const property = await getPropertyBySlugCached(slug);
  if (!property) {
    notFound();
  }

  const record = property as UnknownRecord;
  const related = await getRelatedPropertiesCached(propertyId, 3);
  const photos = getPhotoUrls(record);
  const title = getTitle(record);
  const type = getType(record);
  const operation = getOperation(record);
  const price = getPrice(record);
  const description = getDescription(record);
  const features = getFeatureList(record);
  const address = getAddress(record);
  const coordinates = getCoordinates(record);
  const addressQuery = encodeURIComponent(
    [address.address, address.location, address.city, address.state, address.country]
      .filter(Boolean)
      .join(", "),
  );
  const mapHref = coordinates
    ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
  const mapEmbedUrl = coordinates ? buildOpenStreetMapEmbed(coordinates) : "";
  const stats = getStats(record);
  const updatedAt = getPublishedAt(record);
  const detailRows = [
    { label: "Precio", value: price },
    { label: "Tamaño de la propiedad", value: stats.covered > 0 ? `${stats.covered} m²` : "-" },
    { label: "Superficie total", value: stats.total > 0 ? `${stats.total} m²` : "-" },
    { label: "Dormitorios", value: stats.bedrooms > 0 ? String(stats.bedrooms) : "-" },
    { label: "Baños", value: stats.bathrooms > 0 ? String(stats.bathrooms) : "-" },
    { label: "Ambientes", value: stats.rooms > 0 ? String(stats.rooms) : "-" },
    { label: "Cocheras", value: stats.parking > 0 ? String(stats.parking) : "-" },
    { label: "Tipo de propiedad", value: type },
    { label: "Estado de la propiedad", value: operation },
  ];

  return (
    <main className="min-h-screen bg-secondary">
      <section className="container mx-auto px-4 py-28 lg:px-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <Link href="/#propiedades" className="inline-flex text-sm font-medium text-primary hover:underline">
              ← Volver a propiedades
            </Link>
            <h1 className="text-3xl font-bold text-foreground md:text-5xl">{title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                {type}
              </span>
              <span className="rounded-lg bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
                {operation}
              </span>
            </div>
          </div>
          <div className="rounded-2xl bg-card px-6 py-5 shadow-card">
            <p className="text-sm text-muted-foreground">Precio</p>
            <p className="text-3xl font-bold text-primary">{price}</p>
          </div>
        </div>

        <PropertyGallery photos={photos} title={title} />

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <article className="space-y-8 rounded-2xl bg-card p-7 shadow-card lg:col-span-2">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Descripción</h2>
              {description.length === 0 ? (
                <p className="text-muted-foreground">No hay descripción disponible para esta propiedad.</p>
              ) : (
                description.map((paragraph, index) => (
                  <p key={`${paragraph}-${index}`} className="leading-relaxed text-foreground/85">
                    {paragraph}
                  </p>
                ))
              )}
            </section>
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Características</h2>
              {features.length === 0 ? (
                <p className="text-muted-foreground">No hay características informadas.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {features.map((feature) => (
                    <div key={feature} className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium">
                      {feature}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </article>

          <aside className="space-y-6">
            <section className="rounded-2xl bg-card p-6 shadow-card">
              <h3 className="text-xl font-semibold text-foreground">Descripción general</h3>
              <div className="mt-5 space-y-4 text-sm text-foreground/90">
                <p className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-primary" /> Dormitorios: {stats.bedrooms || "-"}</p>
                <p className="flex items-center gap-2"><Bath className="h-4 w-4 text-primary" /> Baños: {stats.bathrooms || "-"}</p>
                <p className="flex items-center gap-2"><Car className="h-4 w-4 text-primary" /> Cocheras: {stats.parking || "-"}</p>
                <p className="flex items-center gap-2"><Maximize className="h-4 w-4 text-primary" /> Cubiertos: {stats.covered > 0 ? `${stats.covered} m²` : "-"}</p>
                <p className="flex items-center gap-2"><Maximize className="h-4 w-4 text-primary" /> Totales: {stats.total > 0 ? `${stats.total} m²` : "-"}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Ambientes: {stats.rooms || "-"}</p>
              </div>
            </section>

            <section className="rounded-2xl bg-card p-6 shadow-card">
              <h3 className="text-xl font-semibold text-foreground">Dirección</h3>
              <div className="mt-5 space-y-2 text-sm text-foreground/90">
                <p>{address.address}</p>
                <p>{address.location}</p>
                <p>{address.city}</p>
                <p>{address.neighborhood}</p>
                <p>{address.state}</p>
                <p>{address.country}</p>
              </div>
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline"
              >
                Ver en mapa
              </a>
            </section>

            {updatedAt ? (
              <section className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-card">
                Actualizado: {updatedAt}
              </section>
            ) : null}
          </aside>
        </div>

        <section className="mt-10 rounded-2xl bg-card p-7 shadow-card">
          <h2 className="mb-5 text-2xl font-semibold text-foreground">Dirección</h2>
          {coordinates ? (
            <iframe
              title="Mapa de ubicación de la propiedad"
              src={mapEmbedUrl}
              className="h-[380px] w-full rounded-xl border border-border"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-[220px] w-full items-center justify-center rounded-xl border border-dashed border-border bg-secondary text-center">
              <div className="space-y-2 px-6">
                <p className="font-medium text-foreground">Ubicación aproximada</p>
                <p className="text-sm text-muted-foreground">
                  No hay coordenadas exactas en Tokko para esta propiedad.
                </p>
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-sm font-semibold text-primary hover:underline"
                >
                  Abrir en Google Maps
                </a>
              </div>
            </div>
          )}
        </section>

        <section className="mt-10 rounded-2xl bg-card p-7 shadow-card">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-foreground">Detalles</h2>
            {updatedAt ? (
              <p className="text-sm text-muted-foreground">Actualizado: {updatedAt}</p>
            ) : null}
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            {detailRows.map((row, index) => (
              <div
                key={row.label}
                className={`grid grid-cols-1 gap-2 px-5 py-4 text-sm md:grid-cols-2 ${index !== detailRows.length - 1 ? "border-b border-border" : ""}`}
              >
                <p className="font-semibold text-foreground">{row.label}</p>
                <p className="text-foreground/85">{row.value}</p>
              </div>
            ))}
          </div>
        </section>

        {related.length > 0 ? (
          <section className="mt-12">
            <h2 className="mb-5 text-2xl font-semibold text-foreground">Relacionadas</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((item, index) => {
                const r = item as UnknownRecord;
                const rId = toNumber(r.id);
                const rTitle = getTitle(r);
                const rImage = getPhotoUrls(r)[0];
                const rPrice = getPrice(r);
                const rSlug = `${rId}-${index + 1}`;
                return (
                  <Link
                    key={rSlug}
                    href={`/propiedad/${rSlug}`}
                    className="group overflow-hidden rounded-2xl bg-card shadow-card transition hover:shadow-card-hover"
                  >
                    <img src={rImage} alt={rTitle} className="h-48 w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="space-y-3 p-5">
                      <h3 className="line-clamp-2 text-lg font-semibold text-foreground">{rTitle}</h3>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-primary">{rPrice}</p>
                        <span className="text-sm font-medium text-accent">Ver más →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
