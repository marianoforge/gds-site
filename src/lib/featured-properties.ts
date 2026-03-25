const FEATURED_PROPERTIES_STORAGE_KEY = "gds_featured_property_ids";

function normalizeIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const unique = new Set<number>();
  for (const value of raw) {
    const id = typeof value === "number" ? value : Number(value);
    if (Number.isInteger(id) && id > 0) {
      unique.add(id);
    }
  }
  return Array.from(unique);
}

export function readFeaturedPropertyIds(): number[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(FEATURED_PROPERTIES_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    return normalizeIds(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function writeFeaturedPropertyIds(ids: number[]): void {
  if (typeof window === "undefined") {
    return;
  }
  const normalized = normalizeIds(ids);
  window.localStorage.setItem(FEATURED_PROPERTIES_STORAGE_KEY, JSON.stringify(normalized));
}

export function toggleFeaturedPropertyId(currentIds: number[], id: number): number[] {
  const normalized = normalizeIds(currentIds);
  if (normalized.includes(id)) {
    return normalized.filter((value) => value !== id);
  }
  return [...normalized, id];
}

