import { ChordSheet } from "@/types/chordSheet";
import { CacheItem } from '../core/cache-item';
import { initializeCache } from '../core/cache-initializer';
import { saveCache } from '../core/cache-saver';
import { clearCache } from '../core/cache-clearer';
import { isCacheItemExpired } from '../core/cache-expiration-checker';
import { enforceCacheLimit } from '../core/cache-size-enforcer';

// Cache configuration
const CACHE_KEY = 'chordium-chord-sheet-cache';
const MAX_CACHE_ITEMS = 30;
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours

type ChordSheetCacheItem = CacheItem<ChordSheet>;

/**
 * Save chord sheet data to the cache
 */
export function cacheChordSheet(cacheKey: string, chordSheet: ChordSheet): void {
  const cache = initializeCache<ChordSheetCacheItem>(CACHE_KEY);
  
  // Look for existing entry to preserve access count
  const existingItem = cache.items.find(item => item.key === cacheKey);
  const accessCount = existingItem ? existingItem.accessCount + 1 : 1;
  
  // Remove any existing entry with the same key
  const filteredItems = cache.items.filter(item => item.key !== cacheKey);
  
  // Add the new entry
  const newItem: ChordSheetCacheItem = {
    key: cacheKey,
    data: chordSheet,
    timestamp: Date.now(),
    accessCount,
  };
  
  let newItems = [...filteredItems, newItem];
  
  // Enforce cache size limit
  newItems = enforceCacheLimit(newItems, MAX_CACHE_ITEMS);
  
  saveCache(CACHE_KEY, { items: newItems });
}
