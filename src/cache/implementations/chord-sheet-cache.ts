import { ChordSheet } from "@/types/chordSheet";
import { generateCacheKey } from '../core/cache-key-generator';
import { parseCacheKey } from '../core/cache-key-parser';
import { cacheChordSheet as saveChordSheetToCache } from '../operations/cache-chord-sheet';
import { initializeCache } from '../core/cache-initializer';
import { clearCache } from '../core/cache-clearer';
import { isCacheItemExpired } from '../core/cache-expiration-checker';
import { CacheItem } from '../core/cache-item';

// Key for storing chord sheet cache in localStorage
const CHORD_SHEET_CACHE_KEY = 'chordium-chord-sheet-cache';

// Cache expiration time in milliseconds (24 hours)
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

type ChordSheetCacheItem = CacheItem<ChordSheet>;

/**
 * Generate a cache key from artist and title using the new modular utility
 * @param artist - Artist name
 * @param title - Song title
 * @returns Normalized cache key (artist_name-song_title)
 */
export const generateChordSheetCacheKey = (artist: string, title: string): string => {
  return generateCacheKey(artist, title);
};

/**
 * Parse a cache key back to artist and title
 * @param cacheKey - Cache key to parse (artist_name-song_title)
 * @returns Object with artist and title
 */
export const parseChordSheetCacheKey = (cacheKey: string): { artist: string; title: string } => {
  return parseCacheKey(cacheKey);
};

/**
 * Save chord sheet data to the cache using modular utilities
 * @param artist - Artist name
 * @param title - Song title  
 * @param chordSheet - ChordSheet object to cache
 */
export const cacheChordSheet = (artist: string, title: string, chordSheet: ChordSheet): void => {
  const cacheKey = generateCacheKey(artist, title);
  
  // Don't cache if key generation failed (empty string returned)
  if (!cacheKey) {
    console.warn('Cannot cache chord sheet: invalid cache key for', { artist, title });
    return;
  }
  
  saveChordSheetToCache(cacheKey, chordSheet);
};

/**
 * Get cached chord sheet if it exists
 * @param artist - Artist name
 * @param title - Song title
 * @returns The cached ChordSheet or null if not found or expired
 */
export const getCachedChordSheet = (artist: string, title: string): ChordSheet | null => {
  const cacheKey = generateCacheKey(artist, title);
  
  // Return null if key generation failed (empty string returned)
  if (!cacheKey) {
    console.warn('Cannot retrieve chord sheet: invalid cache key for', { artist, title });
    return null;
  }
  
  const cache = initializeCache<ChordSheetCacheItem>(CHORD_SHEET_CACHE_KEY);
  const cacheItem = cache.items.find(item => item.key === cacheKey);
  
  if (!cacheItem) {
    return null;
  }
  
  // Check if cache entry is expired using modular utility
  if (isCacheItemExpired(cacheItem, CACHE_EXPIRATION_TIME)) {
    console.log('Chord sheet cache expired, will fetch fresh data');
    
    // Remove expired item
    const updatedCache = {
      items: cache.items.filter(item => item.key !== cacheKey)
    };
    
    try {
      localStorage.setItem(CHORD_SHEET_CACHE_KEY, JSON.stringify(updatedCache));
    } catch (e) {
      console.error('Failed to save updated cache:', e);
    }
    
    return null;
  }
  
  // Update the timestamp and increment access count
  cacheItem.timestamp = Date.now();
  cacheItem.accessCount = (cacheItem.accessCount ?? 0) + 1;
  
  try {
    localStorage.setItem(CHORD_SHEET_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to update cache access:', e);
  }
  
  return cacheItem.data;
};

/**
 * Clear all expired cache entries
 * @returns The number of entries removed
 */
export const clearExpiredChordSheetCache = (): number => {
  const cache = initializeCache<ChordSheetCacheItem>(CHORD_SHEET_CACHE_KEY);
  const initialCount = cache.items.length;
  
  cache.items = cache.items.filter(item => !isCacheItemExpired(item, CACHE_EXPIRATION_TIME));
  const removedCount = initialCount - cache.items.length;
  
  if (removedCount > 0) {
    console.log(`Removed ${removedCount} expired chord sheet cache entries`);
    try {
      localStorage.setItem(CHORD_SHEET_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.error('Failed to save cache after cleanup:', e);
    }
  }
  
  return removedCount;
};

/**
 * Clear all cached chord sheets using modular utility
 */
export const clearChordSheetCache = (): void => {
  clearCache(CHORD_SHEET_CACHE_KEY);
};

/**
 * Check if a chord sheet is cached for the given artist and title
 * @param artist - Artist name
 * @param title - Song title
 * @returns True if cached and not expired
 */
export const isChordSheetCached = (artist: string, title: string): boolean => {
  const cacheKey = generateCacheKey(artist, title);
  const cache = initializeCache<ChordSheetCacheItem>(CHORD_SHEET_CACHE_KEY);
  const cacheItem = cache.items.find(item => item.key === cacheKey);
  
  if (!cacheItem) return false;
  
  return !isCacheItemExpired(cacheItem, CACHE_EXPIRATION_TIME);
};

/**
 * Get cache statistics using modular utilities
 */
export const getCacheStats = () => {
  const cache = initializeCache<ChordSheetCacheItem>(CHORD_SHEET_CACHE_KEY);
  
  const validItems = cache.items.filter(item => 
    !isCacheItemExpired(item, CACHE_EXPIRATION_TIME)
  );
  
  return {
    totalItems: cache.items.length,
    validItems: validItems.length,
    expiredItems: cache.items.length - validItems.length,
    maxItems: 30, // This should come from config
    cacheExpirationTime: CACHE_EXPIRATION_TIME
  };
};
