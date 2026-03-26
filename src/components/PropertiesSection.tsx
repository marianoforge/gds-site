import { motion } from "framer-motion";
import { BedDouble, Bath, Car, Maximize } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { siteImages } from "@/lib/site-media";
import { isTokkoActive } from "@/lib/tokko";

function PropertyCardSkeleton() {
  return (
    <div className="flex h-full flex-col bg-card rounded-2xl overflow-hidden shadow-card animate-pulse">
      <div className="h-64 bg-muted" />
      <div className="flex flex-1 flex-col p-6 gap-3">
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <div className="h-7 w-24 rounded bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

type TokkoOperation = {
  operation_type?: string;
  prices?: Array<{ currency?: string; price?: number | string }>;
};

type TokkoCardRecord = {
  id?: number;
  status?: number | string | null;
  deleted_at?: string | null;
  publication_title?: string;
  title?: string;
  type?: { name?: string };
  photos?: Array<Record<string, unknown>>;
  operations?: TokkoOperation[];
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
  is_starred?: boolean;
  featured?: boolean;
  starred?: boolean;
} & Record<string, unknown>;

type TokkoListResponse = {
  data?: {
    objects?: TokkoCardRecord[];
  };
};

type FeaturedIdsResponse = {
  ids?: number[];
  properties?: TokkoCardRecord[];
};

type FeaturedProperty = {
  propertyId: number;
  id: string;
  image: string;
  title: string;
  price: string;
  type: string;
  beds: number;
  baths: number;
  parking: number;
  area: string;
  isFeatured: boolean;
};


function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toCapitalizedText(value: string): string {
  return value
    .toLocaleLowerCase("es-AR")
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toLocaleUpperCase("es-AR") + part.slice(1))
    .join(" ");
}

function getImage(item: TokkoCardRecord): string {
  if (!Array.isArray(item.photos) || item.photos.length === 0) {
    return siteImages.property1;
  }
  const first = item.photos[0];
  const url =
    (typeof first.original === "string" && first.original) ||
    (typeof first.image === "string" && first.image) ||
    (typeof first.large === "string" && first.large) ||
    (typeof first.medium === "string" && first.medium) ||
    (typeof first.small === "string" && first.small) ||
    (typeof first.url === "string" && first.url) ||
    "";
  return url || siteImages.property1;
}

function getPrice(item: TokkoCardRecord): string {
  const firstOperation = Array.isArray(item.operations)
    ? item.operations[0]
    : undefined;
  const firstPrice = firstOperation?.prices?.[0];
  const amount = toNumber(firstPrice?.price);
  if (amount > 0) {
    const currency = (firstPrice?.currency ?? "USD").toUpperCase();
    const formatter = new Intl.NumberFormat("es-AR");
    const symbol = currency === "USD" ? "U$S" : currency;
    return `${symbol} ${formatter.format(amount)}`;
  }
  return "Consultar";
}

function getType(item: TokkoCardRecord): string {
  const firstOperation = Array.isArray(item.operations)
    ? item.operations[0]
    : undefined;
  return toCapitalizedText(
    firstOperation?.operation_type ?? item.type?.name ?? "Propiedad",
  );
}

function mapTokkoToCard(
  item: TokkoCardRecord,
  index: number,
): FeaturedProperty {
  const itemId = toNumber(item.id);
  const beds = toNumber(
    item.bedroom_amount || item.room_amount || item.suite_amount,
  );
  const baths = toNumber(item.bathroom_amount || item.bathrooms);
  const parkingRaw =
    typeof item.garage === "boolean"
      ? item.garage
        ? 1
        : 0
      : item.garage || item.parking_lot_amount;
  const parking = toNumber(parkingRaw);
  const areaRaw = toNumber(
    item.roofed_surface || item.total_surface || item.surface,
  );
  const title = item.publication_title ?? item.title ?? "Propiedad";
  return {
    propertyId: itemId,
    id: String(item.id ?? `tokko-${index}`),
    image: getImage(item),
    title: toCapitalizedText(title),
    price: getPrice(item),
    type: getType(item),
    beds,
    baths,
    parking,
    area: areaRaw > 0 ? `${areaRaw} m²` : "-",
    isFeatured: false,
  };
}

function toPropertySlug(propertyId: number, index: number): string {
  return `${propertyId}-${index + 1}`;
}

const PropertiesSection = () => {
  const [tokkoItems, setTokkoItems] = useState<FeaturedProperty[]>([]);
  const [featuredItems, setFeaturedItems] = useState<FeaturedProperty[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingActive, setLoadingActive] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadFeatured = async () => {
      try {
        const res = await fetch("/api/featured-properties", { cache: "no-store" });
        if (!res.ok) {
          return;
        }
        const json = (await res.json()) as FeaturedIdsResponse;
        if (mounted && Array.isArray(json.properties) && json.properties.length > 0) {
          setFeaturedItems(json.properties.map((item, index) => ({ ...mapTokkoToCard(item, index), isFeatured: true })));
        }
      } catch {
      } finally {
        if (mounted) {
          setLoadingFeatured(false);
        }
      }
    };
    void loadFeatured();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const dbRes = await fetch("/api/active-properties", { cache: "no-store" });
        let objects: TokkoCardRecord[] = [];
        if (dbRes.ok) {
          const dbJson = (await dbRes.json()) as TokkoListResponse;
          objects = Array.isArray(dbJson?.data?.objects) ? dbJson.data.objects : [];
        }
        const mapped = objects.filter(isTokkoActive).map(mapTokkoToCard);
        if (mounted) {
          setTokkoItems(mapped);
        }
      } catch {
        if (mounted) {
          setTokkoItems([]);
        }
      } finally {
        if (mounted) {
          setLoadingActive(false);
        }
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const loading = loadingFeatured || loadingActive;

  const properties = useMemo(() => {
    if (featuredItems.length > 0) {
      return featuredItems.slice(0, 3);
    }
    if (tokkoItems.length > 0) {
      return tokkoItems.slice(0, 3).map((item) => ({ ...item, isFeatured: false }));
    }
    return [];
  }, [featuredItems, tokkoItems]);

  return (
    <section id="propiedades" className="py-24 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-accent font-semibold tracking-[0.15em] uppercase text-sm mb-3">
            Propiedades
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Propiedades{" "}
            <span className="font-serif italic font-normal text-primary">
              Destacadas
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Invertí en propiedades seleccionadas con el respaldo de nuestro
            equipo profesional
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))
            : properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="group h-full"
                >
                  <Link
                    href={`/propiedad/${toPropertySlug(property.propertyId, index)}`}
                    className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-card-hover"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        width={800}
                        height={600}
                      />
                      <div className="absolute top-4 left-4">
                        <span className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary-foreground">
                          {property.type}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-foreground">
                          {property.isFeatured ? "Destacado" : "Disponible"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="mb-3 min-h-14 text-lg font-bold text-foreground transition-colors group-hover:text-primary line-clamp-2">
                        {property.title}
                      </h3>

                      <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <BedDouble className="h-4 w-4" /> {property.beds}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Bath className="h-4 w-4" /> {property.baths}
                        </span>
                        {property.parking > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Car className="h-4 w-4" /> {property.parking}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <Maximize className="h-4 w-4" /> {property.area}
                        </span>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                        <p className="text-2xl font-bold text-primary">
                          {property.price}
                        </p>
                        <span className="text-sm font-medium text-accent hover:underline">
                          Ver más →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/propiedades"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            Ver todas las propiedades
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default PropertiesSection;
