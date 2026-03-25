type TokkoStatus = number | string | null | undefined;

function normalizeStatus(status: TokkoStatus): string {
  if (typeof status === "number") {
    return String(status);
  }
  if (typeof status === "string") {
    return status.trim().toLowerCase();
  }
  return "";
}

export function isTokkoActive(record: {
  deleted_at?: unknown;
  status?: TokkoStatus;
}): boolean {
  if (
    typeof record.deleted_at === "string" &&
    record.deleted_at.trim().length > 0
  ) {
    return false;
  }

  const normalized = normalizeStatus(record.status);
  if (!normalized) {
    return true;
  }

  const numeric = Number(normalized);
  if (Number.isFinite(numeric)) {
    return numeric === 1;
  }

  const inactiveStatuses = new Set([
    "inactive",
    "inactiva",
    "deleted",
    "borrada",
    "draft",
    "paused",
    "offmarket",
  ]);
  const activeStatuses = new Set([
    "active",
    "activa",
    "published",
    "publicada",
  ]);

  if (inactiveStatuses.has(normalized)) {
    return false;
  }
  if (activeStatuses.has(normalized)) {
    return true;
  }
  return true;
}
