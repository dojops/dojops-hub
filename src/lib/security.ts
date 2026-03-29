/**
 * Security utilities shared across lib modules.
 *
 * Keeping these in a dedicated module makes them testable without
 * having to export internals from higher-level modules like auth.ts.
 */

// Allowed avatar URL hostnames. This list must match the `remotePatterns`
// in next.config.mjs so that stored URLs can actually be served by
// next/image without triggering a configuration error.
export const ALLOWED_AVATAR_HOSTS = new Set([
  "avatars.githubusercontent.com",
  "lh3.googleusercontent.com",
]);

/**
 * Validate an avatar URL from an external identity provider.
 * Returns the original URL string if it is safe, or null if it is not.
 *
 * Rules:
 * - Must be a valid URL
 * - Protocol must be https:
 * - Hostname must be in ALLOWED_AVATAR_HOSTS
 *
 * This prevents storing arbitrary URLs that could be used as tracking pixels,
 * SSRF probes via next/image, or content injection vectors.
 */
export function sanitizeAvatarUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    if (!ALLOWED_AVATAR_HOSTS.has(parsed.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}
