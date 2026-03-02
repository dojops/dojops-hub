interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60_000);

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

// Pre-configured rate limiters
export const RATE_LIMITS = {
  publish: { maxRequests: 5, windowMs: 3600_000 },      // 5/hour
  star: { maxRequests: 30, windowMs: 60_000 },           // 30/min
  comment: { maxRequests: 10, windowMs: 60_000 },        // 10/min
  search: { maxRequests: 60, windowMs: 60_000 },         // 60/min
  tokenCreate: { maxRequests: 5, windowMs: 3600_000 },   // 5/hour
} as const;
