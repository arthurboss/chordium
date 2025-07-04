import { CacheConfig } from '@/cache/types/unified-chord-sheet-cache';

/**
 * Gets the current cache configuration as a copy
 * This returns a cloned configuration object to prevent external modifications
 * 
 * @param config - The cache configuration object
 * @returns Copy of the cache configuration
 */
export function getConfig(config: CacheConfig): CacheConfig {
  return { ...config };
}
