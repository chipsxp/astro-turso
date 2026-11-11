// Shared in-memory fixed-window rate limiter for API routes.
//
// Each route creates its own limiter instance at module scope (state stays
// isolated per route, matching the per-route Maps this module replaces).
//
// Usage patterns:
// - Check-then-record (reads, register, contact, forgot/reset, sales upload):
//     if (limiter.limited(key)) return json({ error: "..." }, 429);
//     limiter.record(key);
//   Allows exactly `limit` requests per window.
// - Login (record only on failure, clear on success):
//     if (limiter.limited(ip)) return json(..., 429);
//     ... on failed login: limiter.record(ip); return 401
//     ... on success:      limiter.clear(ip);
//
// `articles/view.ts` intentionally keeps its own burst/dedupe maps
// (PR 1 semantics); do not migrate it to this module.

export interface RateLimiter {
  /** True when the key has already hit `limit` inside the current window. */
  limited(key: string): boolean;
  /** Count one event for the key; starts a fresh window when expired. */
  record(key: string): void;
  /** Reset the key (used by login after a successful sign-in). */
  clear(key: string): void;
}

interface LimiterEntry {
  count: number;
  resetAt: number;
}

export function createRateLimiter(options: {
  limit: number;
  windowMs: number;
  maxEntries?: number;
}): RateLimiter {
  const { limit, windowMs, maxEntries = 5000 } = options;
  const attempts = new Map<string, LimiterEntry>();
  let lastSweep = Date.now();
  const SWEEP_INTERVAL_MS = 60_000;

  function sweep(now: number): void {
    if (now - lastSweep < SWEEP_INTERVAL_MS) return;
    lastSweep = now;
    for (const [key, entry] of attempts.entries()) {
      if (now > entry.resetAt) {
        attempts.delete(key);
      }
    }
  }

  function limited(key: string): boolean {
    const now = Date.now();
    sweep(now);
    const entry = attempts.get(key);
    if (!entry || now > entry.resetAt) return false;
    return entry.count >= limit;
  }

  function record(key: string): void {
    const now = Date.now();
    sweep(now);
    const entry = attempts.get(key);
    if (!entry || now > entry.resetAt) {
      if (attempts.size >= maxEntries) {
        const oldestKey = attempts.keys().next().value;
        if (oldestKey) attempts.delete(oldestKey);
      }
      attempts.set(key, { count: 1, resetAt: now + windowMs });
    } else {
      entry.count += 1;
    }
  }

  function clear(key: string): void {
    attempts.delete(key);
  }

  return { limited, record, clear };
}

/** Best-effort client IP for rate-limit keys (leftmost XFF → x-real-ip → "unknown"). */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
