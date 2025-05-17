import { SearchResultItem } from "./search-result-item";

// Key for storing search cache in sessionStorage
const SEARCH_CACHE_KEY = 'chordium-search-cache';

// Maximum number of cache entries to keep
const MAX_CACHE_ITEMS = 20;

// Cache expiration time in milliseconds (30 minutes)
const CACHE_EXPIRATION_TIME = 30 * 60 * 1000;

// Interface for cache items
interface CacheItem {
  key: string;
  results: SearchResultItem[];
  timestamp: number;
  accessCount: number;
  query: {
    artist: string | null;
    song: string | null;
  };
}

// Interface for the entire cache
interface SearchCache {
  items: CacheItem[];
  lastQuery?: {
    artist: string | null;
    song: string | null;
  };
}

/**
 * Generate a cache key based on search params
 */
export const generateCacheKey = (artist: string | null, song: string | null): string => {
  return `${artist || ''}:${song || ''}`;
};

/**
 * Initialize the search cache
 */
const initializeCache = (): SearchCache => {
  try {
    const cache = sessionStorage.getItem(SEARCH_CACHE_KEY);
    return cache ? JSON.parse(cache) : { items: [] };
  } catch (e) {
    console.error('Failed to parse search cache:', e);
    return { items: [] };
  }
};

/**
 * Save the search cache to sessionStorage
 */
const saveCache = (cache: SearchCache): void => {
  try {
    sessionStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to save search cache:', e);
  }
};

/**
 * Save search results to the cache
 */
export const cacheSearchResults = (
  artist: string | null, 
  song: string | null, 
  results: SearchResultItem[]
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
      results,
      timestamp: Date.now(),
      accessCount,
      query: { artist, song }
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
  
  const newCache: SearchCache = {
    items: newItems,
    // Update last query
    lastQuery: { artist, song }
  };
  
  saveCache(newCache);
};

/**
 * Get cached search results if they exist
 * @returns The cached results or null if not found or expired
 */
export const getCachedSearchResults = (artist: string | null, song: string | null): SearchResultItem[] | null => {
  const cache = initializeCache();
  const key = generateCacheKey(artist, song);
  const cacheItem = cache.items.find(item => item.key === key);
  
  if (!cacheItem) return null;
  
  // Check if cache entry is expired
  const now = Date.now();
  if (now - cacheItem.timestamp > CACHE_EXPIRATION_TIME) {
    console.log('Cache expired, will fetch fresh data');
    
    // Remove expired item
    const updatedCache: SearchCache = {
      items: cache.items.filter(item => item.key !== key),
      lastQuery: cache.lastQuery
    };
    saveCache(updatedCache);
    
    return null;
  }
  
  // Update the timestamp and increment access count
  cacheItem.timestamp = now;
  cacheItem.accessCount = (cacheItem.accessCount || 0) + 1;
  saveCache(cache);
  
  return cacheItem.results;
};

/**
 * Get the last search query parameters
 */
export const getLastSearchQuery = (): { artist: string | null; song: string | null } | undefined => {
  const cache = initializeCache();
  return cache.lastQuery;
};

/**
 * Set the last search query parameters (without saving results)
 */
export const setLastSearchQuery = (artist: string | null, song: string | null): void => {
  const cache = initializeCache();
  cache.lastQuery = { artist, song };
  saveCache(cache);
};

/**
 * Clear all expired cache entries
 * @returns The number of entries removed
 */
export const clearExpiredSearchCache = (): number => {
  const cache = initializeCache();
  const now = Date.now();
  
  const initialCount = cache.items.length;
  cache.items = cache.items.filter(item => now - item.timestamp <= CACHE_EXPIRATION_TIME);
  const removedCount = initialCount - cache.items.length;
  
  if (removedCount > 0) {
    console.log(`Removed ${removedCount} expired search cache entries`);
    saveCache(cache);
  }
  
  return removedCount;
};

/**
 * Clear all cached search results
 */
export const clearSearchCache = (): void => {
  try {
    sessionStorage.removeItem(SEARCH_CACHE_KEY);
  } catch (e) {
    console.error('Failed to clear search cache:', e);
  }
};
