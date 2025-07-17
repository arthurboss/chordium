/**
 * Generic cache item interface with common cache metadata
 */
export interface CacheItem<T> {
  key: string;
  data: T;
  timestamp: number;
  accessCount: number;
}
