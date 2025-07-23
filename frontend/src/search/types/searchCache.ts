/**
 * Search cache interface for storing multiple cache items
 */
import type { CacheItem } from './cacheItem';

export interface SearchCache {
  items: CacheItem[];
  lastQuery?: {
    artist: string | null;
    song: string | null;
  };
}
