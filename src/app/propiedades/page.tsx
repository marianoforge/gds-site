 "use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bath, BedDouble, Car, Home, MapPin, Maximize, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteImages } from "@/lib/site-media";

type PropertyItem = {
  propertyId: number;
  slug: string;
  image: string;
  title: string;
  price: string;
  type: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area: string;
};

type TokkoCardRecord = {
  id?: number | string;
  publication_title?: string;
  title?: string;
  type?: { name?: string };
  location?: { name?: string; short_location?: string; full_location?: string };
  operations?: Array<{ prices?: Array<{ currency?: string; price?: number | string }> }>;
  roofed_surface?: number | string;
  total_surface?: number | string;
  surface?: number | string;
  suite_amount?: number | string;
  room_amount?: number | string;
  bedroom_amount?: number | string;
  bathrooms?: number | string;
  bathroom_amount?: number | string;
  parking_lot_amount?: number | string;
  garage?: number | string | boolean;
  photos?: Array<Record<string, unknown>>;
};

const LOCATION_OPTIONS = ["Todas las zonas", "Palermo", "Belgrano", "Recoleta", "Núñez", "Caballito"];
const TYPE_OPTIONS = ["Todos", "Departamento", "Casa", "PH", "Terreno"];
const BEDROOM_OPTIONS = ["Cualquiera", "1", "2", "3", "4+"];
const PAGE_SIZE = 12;

function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toNumberValue(value: unknown): number {
  return typeof value === "number" ? value : Number(value) || 0;
}

function toCapitalizedText(value: string): string {
  return value
    .toLocaleLowerCase("es-AR")
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toLocaleUpperCase("es-AR") + part.slice(1))
    .join(" ");
}

function getFallbackImage(item: TokkoCardRecord): string {
  if (!Array.isArray(item.photos) || item.photos.length === 0) {
    return siteImages.property1;
  }
  const first = item.photos[0];
  return (
    (typeof first.original === "string" && first.original) ||
    (typeof first.image === "string" && first.image) ||
    (typeof first.large === "string" && first.large) ||
    (typeof first.medium === "string" && first.medium) ||
    (typeof first.small === "string" && first.small) ||
    (typeof first.url === "string" && first.url) ||
    siteImages.property1
  );
}

function getFallbackPrice(item: TokkoCardRecord): string {
  const firstPrice = item.operations?.[0]?.prices?.[0];
  const amount = toNumberValue(firstPrice?.price);
  if (amount <= 0) {
    return "Consultar";
  }
  const currency = toStringValue(firstPrice?.currency, "USD").toUpperCase();
  const symbol = currency === "USD" ? "U$S" : currency;
  return `${symbol} ${new Intl.NumberFormat("es-AR").format(amount)}`;
}

function mapRawPropertyToCard(item: TokkoCardRecord, index: number): PropertyItem | null {
  const propertyId = toNumberValue(item.id);
  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    return null;
  }
  const bedrooms = toNumberValue(item.bedroom_amount || item.room_amount || item.suite_amount);
  const bathrooms = toNumberValue(item.bathroom_amount || item.bathrooms);
  const parkingRaw =
    typeof item.garage === "boolean" ? (item.garage ? 1 : 0) : item.garage || item.parking_lot_amount;
  const parking = toNumberValue(parkingRaw);
  const areaRaw = toNumberValue(item.roofed_surface || item.total_surface || item.surface);
  const location = toCapitalizedText(
    toStringValue(item.location?.short_location) ||
      toStringValue(item.location?.name) ||
      toStringValue(item.location?.full_location) ||
      "Zona no informada",
  );
  const type = toCapitalizedText(toStringValue(item.type?.name, "Propiedad"));
  const title = toCapitalizedText(toStringValue(item.publication_title) || toStringValue(item.title) || "Propiedad");
  return {
    propertyId,
    slug: `${propertyId}-${index + 1}`,
    image: getFallbackImage(item),
    title,
    price: getFallbackPrice(item),
    type,
    location,
    bedrooms,
    bathrooms,
    parking,
    area: areaRaw > 0 ? `${areaRaw} m²` : "-",
  };
}

function FiltersBar({
  location,
  type,
  bedrooms,
}: {
  location: string;
  type: string;
  bedrooms: string;
}) {
  return (
    <form className="mb-10 rounded-2xl bg-card p-5 shadow-card md:p-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
        <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
          <MapPin className="h-5 w-5 shrink-0 text-primary" />
          <div className="flex w-full flex-col">
            <span className="text-xs font-medium text-muted-foreground">Ubicación</span>
            <select
              name="ubicacion"
              defaultValue={location}
              className="cursor-pointer bg-transparent text-sm font-medium text-foreground outline-none"
            >
              {LOCATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
          <Home className="h-5 w-5 shrink-0 text-primary" />
          <div className="flex w-full flex-col">
            <span className="text-xs font-medium text-muted-foreground">Tipo</span>
            <select
              name="tipo"
              defaultValue={type}
              className="cursor-pointer bg-transparent text-sm font-medium text-foreground outline-none"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
          <BedDouble className="h-5 w-5 shrink-0 text-primary" />
          <div className="flex w-full flex-col">
            <span className="text-xs font-medium text-muted-foreground">Dormitorios</span>
            <select
              name="dormitorios"
              defaultValue={bedrooms}
              className="cursor-pointer bg-transparent text-sm font-medium text-foreground outline-none"
            >
              {BEDROOM_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
        >
          <Search className="h-5 w-5" />
          Buscar
        </button>
      </div>
    </form>
  );
}

export default function PropertiesPage() {
  const [location, setLocation] = useState("Todas las zonas");
  const [type, setType] = useState("Todos");
  const [bedrooms, setBedrooms] = useState("Cualquiera");
  const [submitted, setSubmitted] = useState({
    location: "Todas las zonas",
    type: "Todos",
    bedrooms: "Cualquiera",
  });
  const [items, setItems] = useState<PropertyItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const key = useMemo(
    () => `${submitted.location}-${submitted.type}-${submitted.bedrooms}`,
    [submitted],
  );

  useEffect(() => {
    let cancelled = false;
    const loadFirstPage = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          location: submitted.location,
          type: submitted.type,
          bedrooms: submitted.bedrooms,
          page: "0",
          pageSize: String(PAGE_SIZE),
        });
        const res = await fetch(`/api/properties/search?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("fetch error");
        }
        const json = (await res.json()) as {
          items?: PropertyItem[];
          hasMore?: boolean;
        };
        if (!cancelled) {
          setItems(Array.isArray(json.items) ? json.items : []);
          setPage(1);
          setHasMore(Boolean(json.hasMore));
          setLoadedOnce(true);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
          setHasMore(false);
          setLoadedOnce(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void loadFirstPage();
    return () => {
      cancelled = true;
    };
  }, [key, submitted]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) {
      return;
    }
    const element = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting || loading || !hasMore) {
          return;
        }
        setLoading(true);
        const params = new URLSearchParams({
          location: submitted.location,
          type: submitted.type,
          bedrooms: submitted.bedrooms,
          page: String(page),
          pageSize: String(PAGE_SIZE),
        });
        fetch(`/api/properties/search?${params.toString()}`, { cache: "no-store" })
          .then(async (res) => {
            if (!res.ok) {
              throw new Error("fetch error");
            }
            const json = (await res.json()) as { items?: PropertyItem[]; hasMore?: boolean };
            const nextItems = Array.isArray(json.items) ? json.items : [];
            setItems((prev) => [...prev, ...nextItems]);
            setPage((prev) => prev + 1);
            setHasMore(Boolean(json.hasMore));
          })
          .catch(() => {
            setHasMore(false);
          })
          .finally(() => {
            setLoading(false);
          });
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, page, submitted]);

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar forceSolid />
      <main className="container mx-auto px-4 pb-20 pt-28 lg:px-8">
        <form
          className="mb-10 rounded-2xl bg-card p-5 shadow-card md:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted({ location, type, bedrooms });
          }}
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
              <MapPin className="h-5 w-5 shrink-0 text-primary" />
              <div className="flex w-full flex-col">
                <span className="text-xs font-medium text-muted-foreground">Ubicación</span>
                <select
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="cursor-pointer bg-transparent text-sm font-medium text-foreground outline-none"
                >
                  {LOCATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
              <Home className="h-5 w-5 shrink-0 text-primary" />
              <div className="flex w-full flex-col">
                <span className="text-xs font-medium text-muted-foreground">Tipo</span>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="cursor-pointer bg-transparent text-sm font-medium text-foreground outline-none"
                >
                  {TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3">
              <BedDouble className="h-5 w-5 shrink-0 text-primary" />
              <div className="flex w-full flex-col">
                <span className="text-xs font-medium text-muted-foreground">Dormitorios</span>
                <select
                  value={bedrooms}
                  onChange={(event) => setBedrooms(event.target.value)}
                  className="cursor-pointer bg-transparent text-sm font-medium text-foreground outline-none"
                >
                  {BEDROOM_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark"
            >
              <Search className="h-5 w-5" />
              Buscar
            </button>
          </div>
        </form>

        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Todas las propiedades</h1>
          <p className="text-sm text-muted-foreground">{items.length} cargadas</p>
        </div>

        {!loadedOnce && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-96 animate-pulse rounded-2xl bg-card shadow-card" />
            ))}
          </div>
        )}

        {loadedOnce && items.length === 0 && !loading && (
          <div className="rounded-2xl bg-card p-10 text-center shadow-card">
            <p className="text-lg font-medium text-foreground">No encontramos propiedades con esos filtros.</p>
            <p className="mt-2 text-sm text-muted-foreground">Probá cambiar ubicación, tipo o cantidad de dormitorios.</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((property) => (
              <Link
                key={`${property.slug}-${property.propertyId}`}
                href={`/propiedad/${property.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-card-hover"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={property.image || siteImages.property1}
                    alt={property.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    width={800}
                    height={600}
                  />
                  <div className="absolute left-4 top-4">
                    <span className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
                      {property.type}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="mb-2 text-sm font-medium text-muted-foreground">{property.location}</p>
                  <h2 className="mb-3 min-h-14 line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                    {property.title}
                  </h2>
                  <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <BedDouble className="h-4 w-4" /> {property.bedrooms}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bath className="h-4 w-4" /> {property.bathrooms}
                    </span>
                    {property.parking > 0 ? (
                      <span className="flex items-center gap-1.5">
                        <Car className="h-4 w-4" /> {property.parking}
                      </span>
                    ) : null}
                    <span className="flex items-center gap-1.5">
                      <Maximize className="h-4 w-4" /> {property.area}
                    </span>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                    <p className="text-2xl font-bold text-primary">{property.price}</p>
                    <span className="text-sm font-medium text-accent hover:underline">Ver más →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="h-8 w-full" />
        {loading && loadedOnce ? (
          <div className="py-6 text-center text-sm text-muted-foreground">Cargando más propiedades...</div>
        ) : null}
        {!hasMore && items.length > 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">No hay más propiedades para mostrar.</div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
