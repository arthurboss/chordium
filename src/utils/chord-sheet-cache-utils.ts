import { ChordSheetData } from "@/hooks/useChordSheet";

// Key for storing chord sheet cache in sessionStorage
const CHORD_SHEET_CACHE_KEY = 'chordium-chord-sheet-cache';

// Maximum number of cache entries to keep
const MAX_CACHE_ITEMS = 20;

// Cache expiration time in milliseconds (30 minutes)
const CACHE_EXPIRATION_TIME = 30 * 60 * 1000;

// Interface for cache items
interface CacheItem {
  key: string;
  data: Omit<ChordSheetData, 'loading' | 'error'>;
  timestamp: number;
  accessCount: number;
}

// Interface for the entire cache
interface ChordSheetCache {
  items: CacheItem[];
}

/**
 * Generate a cache key based on artist and song
 */
export const generateCacheKey = (artist: string | null, song: string | null): string => {
  return `${artist || ''}:${song || ''}`;
};

/**
 * Initialize the chord sheet cache
 */
const initializeCache = (): ChordSheetCache => {
  try {
    const cache = sessionStorage.getItem(CHORD_SHEET_CACHE_KEY);
    return cache ? JSON.parse(cache) : { items: [] };
  } catch (e) {
    console.error('Failed to parse chord sheet cache:', e);
    return { items: [] };
  }
};

/**
 * Save the chord sheet cache to sessionStorage
 */
const saveCache = (cache: ChordSheetCache): void => {
  try {
    sessionStorage.setItem(CHORD_SHEET_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to save chord sheet cache:', e);
  }
};

/**
 * Save chord sheet data to the cache
 */
export const cacheChordSheet = (
  artist: string | null, 
  song: string | null, 
  data: Omit<ChordSheetData, 'loading' | 'error'>
): void => {
  const cache = initializeCache();
  const key = generateCacheKey(artist, song);
  
  // Look for existing entry to preserve access count
  const existingItem = cache.items.find(item => item.key === key);
  const accessCount = existingItem ? existingItem.accessCount + 1 : 1;
  
  // Remove any existing entry with the same key
  const filteredItems = cache.items.filter(item => item.key !== key);
  
  // Add the new entry
  let newItems = [
    ...filteredItems,
    {
      key,
      data,
      timestamp: Date.now(),
      accessCount,
    }
  ];
  
  // If we exceed max cache size, remove least valuable items
  if (newItems.length > MAX_CACHE_ITEMS) {
    // Sort by a combined score of recency and access count
    newItems.sort((a, b) => {
      // Calculate a score based on access count and timestamp
      // This formula can be adjusted to favor recency or popularity
      const scoreA = a.accessCount * 0.7 + (a.timestamp / Date.now()) * 0.3;
      const scoreB = b.accessCount * 0.7 + (b.timestamp / Date.now()) * 0.3;
      return scoreA - scoreB; // Sort ascending, so lowest values are first
    });
    
    // Remove items until we're at the limit
    newItems = newItems.slice(newItems.length - MAX_CACHE_ITEMS);
  }
  
  const newCache: ChordSheetCache = {
    items: newItems
  };
  
  saveCache(newCache);
};

/**
 * Get cached chord sheet if it exists
 * @returns The cached data or null if not found or expired
 */
export const getCachedChordSheet = (artist: string | null, song: string | null): Omit<ChordSheetData, 'loading' | 'error'> | null => {
  const cache = initializeCache();
  const key = generateCacheKey(artist, song);
  const cacheItem = cache.items.find(item => item.key === key);
  
  if (!cacheItem) return null;
  
  // Check if cache entry is expired
  const now = Date.now();
  if (now - cacheItem.timestamp > CACHE_EXPIRATION_TIME) {
    console.log('Chord sheet cache expired, will fetch fresh data');
    
    // Remove expired item
    const updatedCache: ChordSheetCache = {
      items: cache.items.filter(item => item.key !== key)
    };
    saveCache(updatedCache);
    
    return null;
  }
  
  // Update the timestamp and increment access count
  cacheItem.timestamp = now;
  cacheItem.accessCount = (cacheItem.accessCount || 0) + 1;
  saveCache(cache);
  
  return cacheItem.data;
};

/**
 * Clear all expired cache entries
 * @returns The number of entries removed
 */
export const clearExpiredChordSheetCache = (): number => {
  const cache = initializeCache();
  const now = Date.now();
  
  const initialCount = cache.items.length;
  cache.items = cache.items.filter(item => now - item.timestamp <= CACHE_EXPIRATION_TIME);
  const removedCount = initialCount - cache.items.length;
  
  if (removedCount > 0) {
    console.log(`Removed ${removedCount} expired chord sheet cache entries`);
    saveCache(cache);
  }
  
  return removedCount;
};

/**
 * Clear all cached chord sheets
 */
export const clearChordSheetCache = (): void => {
  try {
    sessionStorage.removeItem(CHORD_SHEET_CACHE_KEY);
  } catch (e) {
    console.error('Failed to clear chord sheet cache:', e);
  }
};
