import { ChordSheet } from "@/types/chordSheet";
import { generateChordSheetId, parseChordSheetId } from '../../utils/chord-sheet-id-generator';

// Key for storing chord sheet cache in localStorage
const CHORD_SHEET_CACHE_KEY = 'chordium-chord-sheet-cache';

// Maximum number of cache entries to keep
const MAX_CACHE_ITEMS = 30;

// Cache expiration time in milliseconds (24 hours)
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

// Interface for cache items
interface CacheItem {
  key: string;
  chordSheet: ChordSheet;
  timestamp: number;
  accessCount: number;
}

// Interface for the entire cache
interface ChordSheetCache {
  items: CacheItem[];
}

/**
 * Generate a cache key based on song path
 * For legacy compatibility, if songPath contains artist and song info,
 * this will normalize it to the proper cache key format
 */
export const generateChordSheetCacheKey = (songPath: string): string => {
  // If it's already in the correct format (has underscores), return as-is
  if (songPath.includes('_')) {
    return songPath;
  }
  
  // For paths that don't have underscores, they might be in CifraClub format
  // We can't reliably convert them without knowing the artist/song split
  // So return as-is and let the caller handle the conversion
  return songPath;
};

/**
 * Initialize the chord sheet cache
 */
const initializeCache = (): ChordSheetCache => {
  try {
    const cacheData = localStorage.getItem(CHORD_SHEET_CACHE_KEY);
    if (!cacheData) return { items: [] };
    
    const cache = JSON.parse(cacheData);
    
    // Clean up any problematic cache entries
    if (cache.items && Array.isArray(cache.items)) {
      cache.items = cache.items.filter(item => 
        item?.key && item?.chordSheet && typeof item.chordSheet === 'object'
      );
    } else {
      return { items: [] };
    }
    
    return cache;
  } catch (e) {
    console.error('Failed to parse chord sheet cache:', e);
    // If there was an error, clear the cache to avoid future issues
    try {
      localStorage.removeItem(CHORD_SHEET_CACHE_KEY);
    } catch (clearError) {
      console.error('Failed to clear problematic cache:', clearError);
    }
    return { items: [] };
  }
};

/**
 * Save the chord sheet cache to localStorage
 */
const saveCache = (cache: ChordSheetCache): void => {
  try {
    localStorage.setItem(CHORD_SHEET_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to save chord sheet cache:', e);
  }
};

/**
 * Save chord sheet data to the cache
 */
export const cacheChordSheet = (
  songPath: string, 
  chordSheet: ChordSheet
): void => {
  const cache = initializeCache();
  const key = generateChordSheetCacheKey(songPath);
  
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
      chordSheet,
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
export const getCachedChordSheet = (songPath: string): ChordSheet | null => {
  const cache = initializeCache();
  const key = generateChordSheetCacheKey(songPath);
  const cacheItem = cache.items.find(item => item.key === key);
  
  if (!cacheItem) {
    return null;
  }
  
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
  
  return cacheItem.chordSheet;
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
    localStorage.removeItem(CHORD_SHEET_CACHE_KEY);
  } catch (e) {
    console.error('Failed to clear chord sheet cache:', e);
  }
};

/**
 * Check if a chord sheet is cached for the given song path
 */
export const isChordSheetCached = (songPath: string): boolean => {
  const cache = initializeCache();
  const key = generateChordSheetCacheKey(songPath);
  const cacheItem = cache.items.find(item => item.key === key);
  
  if (!cacheItem) return false;
  
  // Check if cache entry is expired
  const now = Date.now();
  return (now - cacheItem.timestamp) <= CACHE_EXPIRATION_TIME;
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  const cache = initializeCache();
  const now = Date.now();
  
  const validItems = cache.items.filter(item => 
    (now - item.timestamp) <= CACHE_EXPIRATION_TIME
  );
  
  return {
    totalItems: cache.items.length,
    validItems: validItems.length,
    expiredItems: cache.items.length - validItems.length,
    maxItems: MAX_CACHE_ITEMS,
    cacheExpirationTime: CACHE_EXPIRATION_TIME
  };
};
