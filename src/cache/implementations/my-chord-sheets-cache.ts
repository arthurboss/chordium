import { ChordSheet } from "@/types/chordSheet";
import { generateCacheKey } from '../core/cache-key-generator';
import { parseCacheKey } from '../core/cache-key-parser';
import { initializeCache } from '../core/cache-initializer';
import { clearCache } from '../core/cache-clearer';
import { isCacheItemExpired } from '../core/cache-expiration-checker';
import { enforceCacheLimit } from '../core/cache-size-enforcer';
import { CacheItem } from '../core/cache-item';

// Key for storing my chord sheets cache in localStorage
const MY_CHORD_SHEETS_CACHE_KEY = 'chordium-user-saved-chord-sheets';

// Maximum number of chord sheets to keep in My Chord Sheets (higher than regular cache)
const MAX_MY_CHORD_SHEETS = 100;

// My Chord Sheets cache expiration time in milliseconds (30 days)
const MY_CHORD_SHEETS_EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000;

type MyChordSheetsCacheItem = CacheItem<ChordSheet>;

/**
 * Add a chord sheet to My Chord Sheets using the same cache structure as chord-sheet-cache
 * @param artist - Artist name
 * @param title - Song title
 * @param chordSheet - ChordSheet object to store
 */
export function addToMyChordSheets(artist: string, title: string, chordSheet: ChordSheet): void {
  const cacheKey = generateCacheKey(artist, title);
  const cache = initializeCache<MyChordSheetsCacheItem>(MY_CHORD_SHEETS_CACHE_KEY);
  
  // Look for existing entry to preserve access count
  const existingItem = cache.items.find(item => item.key === cacheKey);
  const accessCount = existingItem ? existingItem.accessCount + 1 : 1;
  
  // Remove any existing entry with the same key
  const filteredItems = cache.items.filter(item => item.key !== cacheKey);
  
  // Add the new entry at the beginning (most recent first)
  const newItem: MyChordSheetsCacheItem = {
    key: cacheKey,
    data: chordSheet,
    timestamp: Date.now(),
    accessCount,
  };
  
  let newItems = [newItem, ...filteredItems];
  
  // Enforce cache size limit
  newItems = enforceCacheLimit(newItems, MAX_MY_CHORD_SHEETS);
  
  try {
    localStorage.setItem(MY_CHORD_SHEETS_CACHE_KEY, JSON.stringify({ items: newItems }));
  } catch (e) {
    console.error('Failed to save My Chord Sheets:', e);
  }
}

/**
 * Get a chord sheet from My Chord Sheets
 * @param artist - Artist name
 * @param title - Song title
 * @returns ChordSheet object or null if not found
 */
export function getFromMyChordSheets(artist: string, title: string): ChordSheet | null {
  const cacheKey = generateCacheKey(artist, title);
  const cache = initializeCache<MyChordSheetsCacheItem>(MY_CHORD_SHEETS_CACHE_KEY);
  const cacheItem = cache.items.find(item => item.key === cacheKey);
  
  if (!cacheItem) {
    return null;
  }
  
  // Check if cache entry is expired (for My Chord Sheets, this might be much longer)
  if (isCacheItemExpired(cacheItem, MY_CHORD_SHEETS_EXPIRATION_TIME)) {
    console.log('My Chord Sheets entry expired, removing from storage');
    
    // Remove expired item
    const updatedCache = {
      items: cache.items.filter(item => item.key !== cacheKey)
    };
    
    try {
      localStorage.setItem(MY_CHORD_SHEETS_CACHE_KEY, JSON.stringify(updatedCache));
    } catch (e) {
      console.error('Failed to save updated My Chord Sheets:', e);
    }
    
    return null;
  }
  
  // Update the timestamp and increment access count
  cacheItem.timestamp = Date.now();
  cacheItem.accessCount = (cacheItem.accessCount ?? 0) + 1;
  
  try {
    localStorage.setItem(MY_CHORD_SHEETS_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to update My Chord Sheets access:', e);
  }
  
  return cacheItem.data;
}

/**
 * Get all chord sheets from My Chord Sheets
 * @returns Array of ChordSheet objects
 */
export function getAllFromMyChordSheets(): ChordSheet[] {
  const cache = initializeCache<MyChordSheetsCacheItem>(MY_CHORD_SHEETS_CACHE_KEY);
  
  // Filter out expired items
  const validItems = cache.items.filter(item => 
    !isCacheItemExpired(item, MY_CHORD_SHEETS_EXPIRATION_TIME)
  );
  
  // If we filtered out expired items, save the updated cache
  if (validItems.length !== cache.items.length) {
    try {
      localStorage.setItem(MY_CHORD_SHEETS_CACHE_KEY, JSON.stringify({ items: validItems }));
    } catch (e) {
      console.error('Failed to save My Chord Sheets after cleanup:', e);
    }
  }
  
  // Sort by timestamp (newest first) then by access count
  const sortedItems = [...validItems].sort((a, b) => {
    // Primary sort: timestamp (newest first)
    if (b.timestamp !== a.timestamp) {
      return b.timestamp - a.timestamp;
    }
    // Secondary sort: access count (most accessed first)
    return b.accessCount - a.accessCount;
  });
  
  return sortedItems.map(item => item.data);
}

/**
 * Update a chord sheet in My Chord Sheets
 * @param artist - Artist name
 * @param title - Song title
 * @param chordSheet - Updated ChordSheet object
 */
export function updateInMyChordSheets(artist: string, title: string, chordSheet: ChordSheet): void {
  const cacheKey = generateCacheKey(artist, title);
  const cache = initializeCache<MyChordSheetsCacheItem>(MY_CHORD_SHEETS_CACHE_KEY);
  
  const existingItemIndex = cache.items.findIndex(item => item.key === cacheKey);
  
  if (existingItemIndex !== -1) {
    // Update existing item, preserving access count and updating timestamp
    cache.items[existingItemIndex] = {
      ...cache.items[existingItemIndex],
      data: chordSheet,
      timestamp: Date.now(),
      accessCount: cache.items[existingItemIndex].accessCount + 1,
    };
    
    try {
      localStorage.setItem(MY_CHORD_SHEETS_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.error('Failed to update My Chord Sheets:', e);
    }
  } else {
    // Item doesn't exist, add it
    addToMyChordSheets(artist, title, chordSheet);
  }
}

/**
 * Remove a chord sheet from My Chord Sheets
 * @param artist - Artist name
 * @param title - Song title
 */
export function removeFromMyChordSheets(artist: string, title: string): void {
  const cacheKey = generateCacheKey(artist, title);
  const cache = initializeCache<MyChordSheetsCacheItem>(MY_CHORD_SHEETS_CACHE_KEY);
  
  const filteredItems = cache.items.filter(item => item.key !== cacheKey);
  
  if (filteredItems.length !== cache.items.length) {
    try {
      localStorage.setItem(MY_CHORD_SHEETS_CACHE_KEY, JSON.stringify({ items: filteredItems }));
    } catch (e) {
      console.error('Failed to remove from My Chord Sheets:', e);
    }
  }
}

/**
 * Check if a chord sheet exists in My Chord Sheets
 * @param artist - Artist name
 * @param title - Song title
 * @returns True if exists and not expired
 */
export function isInMySongs(artist: string, title: string): boolean {
  const cacheKey = generateCacheKey(artist, title);
  const cache = initializeCache<MyChordSheetsCacheItem>(MY_CHORD_SHEETS_CACHE_KEY);
  const cacheItem = cache.items.find(item => item.key === cacheKey);
  
  if (!cacheItem) return false;
  
  return !isCacheItemExpired(cacheItem, MY_CHORD_SHEETS_EXPIRATION_TIME);
}

/**
 * Clear all My Chord Sheets
 */
export function clearMyChordSheets(): void {
  clearCache(MY_CHORD_SHEETS_CACHE_KEY);
}

/**
 * Get My Chord Sheets statistics
 */
export function getMySongsStats() {
  const cache = initializeCache<MyChordSheetsCacheItem>(MY_CHORD_SHEETS_CACHE_KEY);
  
  const validItems = cache.items.filter(item => 
    !isCacheItemExpired(item, MY_CHORD_SHEETS_EXPIRATION_TIME)
  );
  
  return {
    totalItems: cache.items.length,
    validItems: validItems.length,
    expiredItems: cache.items.length - validItems.length,
    maxItems: MAX_MY_CHORD_SHEETS,
    cacheExpirationTime: MY_CHORD_SHEETS_EXPIRATION_TIME
  };
}

/**
 * Parse a cache key back to artist and title
 * @param cacheKey - Cache key to parse (artist_name-song_title)
 * @returns Object with artist and title
 */
export function parseMyChordSheetsCacheKey(cacheKey: string): { artist: string; title: string } {
  return parseCacheKey(cacheKey);
}
