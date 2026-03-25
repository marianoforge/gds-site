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

const INACTIVE_STRING_STATUSES = new Set([
  "inactive",
  "inactiva",
  "deleted",
  "borrada",
  "draft",
  "paused",
  "offmarket",
]);

export function isTokkoActive(record: {
  status?: TokkoStatus;
}): boolean {
  const normalized = normalizeStatus(record.status);
  if (INACTIVE_STRING_STATUSES.has(normalized)) {
    return false;
  }
  return true;
}
