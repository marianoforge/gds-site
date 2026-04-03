import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const hits = new Map<string, number[]>();

function parsePositiveInt(value: string | undefined, fallback: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) {
    return fallback;
  }
  return Math.min(Math.floor(n), max);
}

function getMaxRequests(): number {
  return parsePositiveInt(process.env.CONTACT_RATE_LIMIT_MAX, 5, 60);
}

function getWindowMs(): number {
  const sec = parsePositiveInt(process.env.CONTACT_RATE_LIMIT_WINDOW_SEC, 900, 86400);
  return sec * 1000;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }
  return "unknown";
}

function memoryConsume(
  id: string,
  max: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  let timestamps = hits.get(id) ?? [];
  timestamps = timestamps.filter((t) => now - t < windowMs);
  if (timestamps.length >= max) {
    const oldest = timestamps[0]!;
    hits.set(id, timestamps);
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    };
  }
  timestamps.push(now);
  hits.set(id, timestamps);
  if (hits.size > 50_000) {
    for (const [key, ts] of hits) {
      if (ts.every((t) => now - t >= windowMs)) {
        hits.delete(key);
      }
    }
  }
  return { ok: true };
}

let upstashLimiter: Ratelimit | null | undefined;

function getUpstashLimiter(): Ratelimit | null {
  if (upstashLimiter !== undefined) {
    return upstashLimiter;
  }
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    upstashLimiter = null;
    return null;
  }
  const max = getMaxRequests();
  const windowMs = getWindowMs();
  const minutes = Math.max(1, Math.ceil(windowMs / 60_000));
  const duration = `${minutes} m` as `${number} m`;
  upstashLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(max, duration),
    prefix: "ratelimit:contact",
  });
  return upstashLimiter;
}

export async function tryConsumeContactSlot(
  request: Request,
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const id = `ip:${getClientIp(request)}`;
  const max = getMaxRequests();
  const windowMs = getWindowMs();

  const limiter = getUpstashLimiter();
  if (limiter) {
    const { success, reset } = await limiter.limit(id);
    if (!success) {
      const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return { ok: false, retryAfterSec };
    }
    return { ok: true };
  }

  return memoryConsume(id, max, windowMs);
}

export function resetContactRateLimitMemoryForTests(): void {
  hits.clear();
  upstashLimiter = undefined;
}
