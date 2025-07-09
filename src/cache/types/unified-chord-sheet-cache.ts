import { ChordSheet } from "@/types/chordSheet";

/**
 * Generic cache item interface
 */
export interface CacheItem<T> {
  key: string;
  data: T;
  timestamp: number;
  accessCount: number;
}

/**
 * Metadata for enhanced chord sheet cache entries
 */
export interface ChordSheetMetadata {
  saved: boolean;               // Whether the user has saved this chord sheet (replaces my-chord-sheets-cache)
  lastAccessed: number;         // For LRU cleanup and usage tracking
  accessCount: number;          // Number of times accessed
}

/**
 * Cache information for chord sheet entries
 */
export interface ChordSheetCacheInfo {
  cachedAt: number;            // When this item was first cached
  expiresAt: number;           // When this item should expire
  version: string;             // For cache invalidation (future use)
}

/**
 * Unified chord sheet data with metadata
 */
export interface UnifiedChordSheetData extends ChordSheet {
  metadata: ChordSheetMetadata;
  cacheInfo: ChordSheetCacheInfo;
}

/**
 * Cache item for the unified chord sheet cache
 */
export type UnifiedChordSheetCacheItem = CacheItem<UnifiedChordSheetData>;

/**
 * Configuration for cache behavior
 */
export interface CacheConfig {
  // Cache expiration times
  regularExpirationTime: number;    // 24 hours for regular cached items
  savedExpirationTime: number;      // Time in ms for saved items (use Number.MAX_SAFE_INTEGER for never expires)
  
  // Cache size limits
  maxRegularItems: number;          // Max non-saved items (LRU eviction)
  maxSavedItems: number;           // Max saved items
  
  // Storage key
  storageKey: string;
}

/**
 * Statistics for the unified cache
 */
export interface UnifiedCacheStats {
  totalItems: number;
  savedItems: number;
  regularItems: number;
  expiredItems: number;
  validItems: number;
  cacheConfig: CacheConfig;
}

/**
 * Options when caching a chord sheet
 */
export interface CacheChordSheetOptions {
  saved?: boolean;              // Whether to mark as saved (default: false)
  accessCount?: number;         // Initial access count (default: 1)
  dataSource?: 'scraping' | 's3' | 'sample' | 'local';  // Where the data came from
}
