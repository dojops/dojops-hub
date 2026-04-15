import { NextRequest } from "next/server";

/**
 * Extract client IP from proxy headers.
 * Prefer Vercel/Cloudflare headers that are set by the edge and cannot be spoofed,
 * then fall back to the leftmost X-Forwarded-For entry (the original client IP
 * in standard proxy configurations like nginx, AWS ALB, Cloudflare).
 */
export function getClientIp(req: NextRequest): string {
  // Vercel sets this automatically and it cannot be spoofed by the client
  const vercelIp = req.headers.get("x-real-ip");
  if (vercelIp) return vercelIp;

  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0].trim();
  }
  return "unknown";
}

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

function envLimit(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

// Pre-configured rate limiters.
// Publish and token-create limits can be overridden via env vars for bulk
// bootstrap operations (e.g. seeding the hub with all built-in skills).
export const RATE_LIMITS = {
  publish: {
    maxRequests: envLimit("DOJOPS_HUB_PUBLISH_LIMIT", 5),
    windowMs: 3_600_000,
  }, // default 5/hour
  star: { maxRequests: 30, windowMs: 60_000 }, // 30/min
  comment: { maxRequests: 10, windowMs: 60_000 }, // 10/min
  search: { maxRequests: 60, windowMs: 60_000 }, // 60/min
  tokenCreate: {
    maxRequests: envLimit("DOJOPS_HUB_TOKEN_CREATE_LIMIT", 5),
    windowMs: 3_600_000,
  }, // default 5/hour
} as const;
