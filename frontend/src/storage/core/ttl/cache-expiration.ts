import { TTL } from './constants';

/**
 * Cache expiration calculation utilities
 * 
 * Provides functions for calculating cache expiration timestamps
 * to ensure consistent TTL behavior across all storage systems.
 */

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
  return fromTimestamp + TTL.CHORD_SHEETS;
}
