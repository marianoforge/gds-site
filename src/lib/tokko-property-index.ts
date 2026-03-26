type TokkoOperation = {
  operation_type?: string;
  prices?: Array<{ currency?: string; price?: number | string }>;
};

type TokkoType = {
  name?: string;
};

type TokkoLocation = {
  name?: string;
  short_location?: string;
  full_location?: string;
};

type TokkoPhoto = Record<string, unknown>;

type TokkoPropertyRecord = {
  id?: number | string;
  publication_title?: string;
  title?: string;
  type?: TokkoType;
  location?: TokkoLocation;
  operations?: TokkoOperation[];
  bedroom_amount?: number | string;
  room_amount?: number | string;
  suite_amount?: number | string;
  bathroom_amount?: number | string;
  bathrooms?: number | string;
  garage?: number | string | boolean;
  parking_lot_amount?: number | string;
  roofed_surface?: number | string;
  total_surface?: number | string;
  surface?: number | string;
  photos?: TokkoPhoto[];
} & Record<string, unknown>;

export type PropertyIndexRow = {
  propertyId: number;
  slug: string;
  title: string;
  type: string;
  operation: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area: number;
  priceValue: number;
  priceLabel: string;
  mainImage: string;
};

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toCapitalizedText(value: string): string {
  return value
    .toLocaleLowerCase("es-AR")
    .split(" ")
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toLocaleUpperCase("es-AR") + part.slice(1))
    .join(" ");
}

function getImage(item: TokkoPropertyRecord): string {
  if (!Array.isArray(item.photos) || item.photos.length === 0) {
    return "";
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
  return url;
}

function getPrice(item: TokkoPropertyRecord): { value: number; label: string } {
  const firstOperation = Array.isArray(item.operations) ? item.operations[0] : undefined;
  const firstPrice = firstOperation?.prices?.[0];
  const amount = toNumber(firstPrice?.price);
  if (amount > 0) {
    const currency = (firstPrice?.currency ?? "USD").toUpperCase();
    const formatter = new Intl.NumberFormat("es-AR");
    const symbol = currency === "USD" ? "U$S" : currency;
    return { value: amount, label: `${symbol} ${formatter.format(amount)}` };
  }
  return { value: 0, label: "Consultar" };
}

export function buildPropertyIndexRow(
  item: TokkoPropertyRecord,
  fallbackOrder: number,
): PropertyIndexRow | null {
  const propertyId = toNumber(item.id);
  if (!Number.isInteger(propertyId) || propertyId <= 0) {
    return null;
  }
  const title = toCapitalizedText(toText(item.publication_title) || toText(item.title) || "Propiedad");
  const type = toCapitalizedText(toText(item.type?.name) || "Propiedad");
  const operation = toCapitalizedText(toText(item.operations?.[0]?.operation_type) || "Venta");
  const locationRaw = toText(item.location?.short_location) || toText(item.location?.name) || toText(item.location?.full_location) || "Zona no informada";
  const location = toCapitalizedText(locationRaw);
  const bedrooms = toNumber(item.bedroom_amount || item.room_amount || item.suite_amount);
  const bathrooms = toNumber(item.bathroom_amount || item.bathrooms);
  const parkingRaw =
    typeof item.garage === "boolean"
      ? item.garage
        ? 1
        : 0
      : item.garage || item.parking_lot_amount;
  const parking = toNumber(parkingRaw);
  const area = toNumber(item.roofed_surface || item.total_surface || item.surface);
  const price = getPrice(item);
  const mainImage = getImage(item);
  return {
    propertyId,
    slug: `${propertyId}-${fallbackOrder}`,
    title,
    type,
    operation,
    location,
    bedrooms,
    bathrooms,
    parking,
    area,
    priceValue: price.value,
    priceLabel: price.label,
    mainImage,
  };
}
