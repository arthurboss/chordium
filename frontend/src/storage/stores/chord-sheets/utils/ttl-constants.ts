import { TTL } from "../../../core/ttl/constants";

/**
 * Time-to-live (TTL) constants for chord sheet storage
 * 
 * Centralizes expiration settings to ensure consistent cache management
 * across the storage system and prevent magic numbers in code.
 */

/**
 * Default TTL for cached chord sheets (7 days in milliseconds)
 * 
 * Cached items expire after this duration to prevent storage bloat
 * while saved items remain permanently stored.
 */
export const DEFAULT_CACHE_TTL_MS = TTL.CHORD_SHEETS;

/**
 * Calculates expiration timestamp for cached items
 * 
 * Provides consistent TTL calculation across all cache operations
 * to ensure uniform expiration behavior.
 * 
 * @param fromTimestamp - Base timestamp (defaults to current time)
 * @returns Expiration timestamp for TTL logic
 */
export function calculateCacheExpiration(fromTimestamp: number = Date.now()): number {
  return fromTimestamp + DEFAULT_CACHE_TTL_MS;
}
