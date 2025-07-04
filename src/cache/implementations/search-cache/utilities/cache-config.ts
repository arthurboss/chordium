/**
 * Default configuration constants for search cache
 * These values control cache behavior and limits
 */

export const SEARCH_CACHE_CONFIG = {
  MAX_CACHE_ITEMS: 100,
  CACHE_EXPIRATION_TIME: 30 * 24 * 60 * 60 * 1000, // 30 days
  MAX_CACHE_SIZE_BYTES: 4 * 1024 * 1024, // 4MB
} as const;
