import { parseCacheKey } from '@/cache/core/cache-key-parser';

/**
 * Parses a cache key back to artist and title components
 * This utility function extracts the original artist and title from a cache key
 * 
 * @param cacheKey - Cache key to parse
 * @returns Object with artist and title
 */
export function parseCacheKeyToComponents(cacheKey: string): { artist: string; title: string } {
  return parseCacheKey(cacheKey);
}
