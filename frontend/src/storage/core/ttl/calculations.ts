/**
 * TTL calculation utilities
 */

/**
 * Calculates expiration timestamp for cached items
 * @param ttl - Time to live in milliseconds, or null for no expiration
 * @returns Expiration timestamp or null for permanent storage
 */
export function calculateExpirationTime(ttl: number | null): number | null {
  return ttl ? Date.now() + ttl : null;
}
