import { CacheItem } from './cache-item';

/**
 * Check if a cache item is expired
 * @param item - The cache item to check
 * @param expirationTime - Time in milliseconds for expiration
 * @returns True if expired, false if still valid
 */
export function isCacheItemExpired<T>(item: CacheItem<T>, expirationTime: number): boolean {
  const now = Date.now();
  return (now - item.timestamp) > expirationTime;
}
