import { Song } from "@/types/song";

// Environment-based logging utility to prevent memory leaks in tests
const isTestEnvironment = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
const isVitestRunning = typeof process !== 'undefined' && process.env.VITEST === 'true';
const shouldLog = !isTestEnvironment && !isVitestRunning;

const debugLog = (message: string, ...args: unknown[]) => {
  if (shouldLog) {
    console.log(message, ...args);
  }
};

const debugError = (message: string, ...args: unknown[]) => {
  if (shouldLog) {
    console.error(message, ...args);
  }
};

// Key for storing search cache in localStorage (changed from sessionStorage for persistence)
const SEARCH_CACHE_KEY = 'chordium-search-cache';

// Maximum number of cache entries to keep - no limit since we want to cache all searches
// But we'll implement a size-based cleanup mechanism
const MAX_CACHE_ITEMS = 100;

// Cache expiration time in milliseconds (1 month)
const CACHE_EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000;

// Max cache size in bytes (4MB)
const MAX_CACHE_SIZE_BYTES = 4 * 1024 * 1024;

// In-memory LRU cache for fast access (optional, fallback to localStorage)
const inMemoryCache = new Map<string, CacheItem>();

// Interface for cache items
interface CacheItem {
  key: string;
  results: Song[];
  timestamp: number;
  accessCount: number;
  query: {
    artist: string | null;
    song: string | null;
    [key: string]: string | null;
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
 * Generate a cache key based on search params (artist, song, and future filters)
 */
export const generateCacheKey = (artist: string | null, song: string | null, extra?: Record<string, string | null>): string => {
  // Normalize inputs
  const clean = (v: string | null | undefined) => (v ? v.trim().toLowerCase() : '');
  let key = `artist:${clean(artist)}|song:${clean(song)}`;
  if (extra) {
    Object.entries(extra).forEach(([k, v]) => {
      key += `|${k}:${clean(v)}`;
    });
  }
  return key;
};

/**
 * Initialize the search cache
 */
const initializeCache = (): SearchCache => {
  try {
    const cacheData = localStorage.getItem(SEARCH_CACHE_KEY);
    if (!cacheData) return { items: [] };
    
    const cache = JSON.parse(cacheData);
    
    // Clear any problematic cache items where query is missing or invalid
    if (cache.items && Array.isArray(cache.items)) {
      cache.items = cache.items.filter(item => 
        item && item.key && 
        item.results && Array.isArray(item.results) &&
        item.query && (typeof item.query === 'object')
      );
    } else {
      return { items: [] };
    }
    
    return cache;
  } catch (e) {
    debugError('Failed to parse search cache:', e);
    // If there was an error, clear the cache to avoid future issues
    try {
      localStorage.removeItem(SEARCH_CACHE_KEY);
    } catch (clearError) {
      debugError('Failed to clear problematic cache:', clearError);
    }
    return { items: [] };
  }
};

/**
 * Calculate the size of the cache in bytes
 */
const calculateCacheSize = (cache: SearchCache): number => {
  return new Blob([JSON.stringify(cache)]).size;
};

/**
 * Save the search cache to localStorage with size check
 */
const saveCache = (cache: SearchCache): void => {
  try {
    const cacheSize = calculateCacheSize(cache);
    
    // If cache is too large, remove items until it's under the size limit
    if (cacheSize > MAX_CACHE_SIZE_BYTES) {
      debugLog(`Cache size (${cacheSize} bytes) exceeds limit, cleaning up...`);
      
      // Sort by combined score (recency and access count)
      cache.items.sort((a, b) => {
        const scoreA = a.accessCount * 0.7 + (a.timestamp / Date.now()) * 0.3;
        const scoreB = b.accessCount * 0.7 + (b.timestamp / Date.now()) * 0.3;
        return scoreA - scoreB; // Sort ascending, lowest scores first to be removed
      });
      
      // Remove items until cache size is acceptable
      while (calculateCacheSize(cache) > MAX_CACHE_SIZE_BYTES * 0.8 && cache.items.length > 0) {
        cache.items.shift(); // Remove the least valuable item
      }
      
      debugLog(`Cache cleaned up, new size: ${calculateCacheSize(cache)} bytes with ${cache.items.length} items`);
    }
    
    localStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    debugError('Failed to save search cache:', e);
  }
};

/**
 * Save search results to the cache
 */
export const cacheSearchResults = (
  artist: string | null, 
  song: string | null, 
  results: Song[],
  extra?: Record<string, string | null>
): void => {
  const cache = initializeCache();
  const key = generateCacheKey(artist, song, extra);
  
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
      query: { artist, song, ...extra }
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

  // Add to in-memory cache
  inMemoryCache.set(key, {
    key,
    results,
    timestamp: Date.now(),
    accessCount,
    query: { artist, song, ...extra }
  });
};

/**
 * Get cached search results if they exist
 * @returns The cached results or null if not found or expired
 */
export const getCachedSearchResults = (artist: string | null, song: string | null, extra?: Record<string, string | null>): Song[] | null => {
  const key = generateCacheKey(artist, song, extra);

  // Try in-memory cache first
  if (inMemoryCache.has(key)) {
    const item = inMemoryCache.get(key)!;
    // Check expiry
    if (Date.now() - item.timestamp > CACHE_EXPIRATION_TIME) {
      inMemoryCache.delete(key);
      return null;
    }
    item.timestamp = Date.now();
    item.accessCount++;
    return item.results;
  }

  // Fallback to persistent cache
  const cache = initializeCache();
  const cacheItem = cache.items.find(item => item.key === key);
  
  if (!cacheItem) return null;
  
  // Verify that the cache item actually matches the current search query
  // We use a less strict comparison now as the cache key should be enough
  // Normalize strings for comparison to handle small differences in formatting
  const normalizeForCompare = (str: string | null): string => 
    str ? str.trim().toLowerCase() : '';
    
  const artistMatches = normalizeForCompare(cacheItem.query.artist) === normalizeForCompare(artist);
  const songMatches = normalizeForCompare(cacheItem.query.song) === normalizeForCompare(song);
  
  if (!artistMatches || !songMatches) {
    debugLog('Cache key matches but search parameters differ, returning null');
    return null;
  }
  
  // Check if cache entry is expired
  const now = Date.now();
  if (now - cacheItem.timestamp > CACHE_EXPIRATION_TIME) {
    debugLog('Cache expired, will fetch fresh data');
    
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
    debugLog(`Removed ${removedCount} expired search cache entries`);
    saveCache(cache);
  }
  
  return removedCount;
};

/**
 * Clear all cached search results
 */
export const clearSearchCache = (): void => {
  try {
    localStorage.removeItem(SEARCH_CACHE_KEY);
    inMemoryCache.clear();
  } catch (e) {
    debugError('Failed to clear search cache:', e);
  }
};

/**
 * Get cached search results with conditional background refresh
 * If results are stale (24-hour threshold), display cache but refresh in background
 * @returns An object containing the cached results and a promise for potentially refreshed results
 */
export const getSearchResultsWithRefresh = async (
  artist: string | null, 
  song: string | null,
  refreshCallback?: (newResults: Song[]) => void
): Promise<{
  immediate: Song[] | null;
  refreshPromise: Promise<Song[] | null>;
}> => {
  debugLog('getSearchResultsWithRefresh called with:', { artist, song });
  const cache = initializeCache();
  const key = generateCacheKey(artist, song);
  const cacheItem = cache.items.find(item => item.key === key);
  
  // Threshold for "stale" data that needs a background refresh (24 hours)
  const REFRESH_THRESHOLD = 24 * 60 * 60 * 1000;
  
  let needsRefresh = false;
  let immediateResults: Song[] | null = null;
  
  if (cacheItem) {
    const now = Date.now();
    
    // Verify that the cache item actually matches the current search query
    // We use a less strict comparison now as the cache key should be enough
    // Normalize strings for comparison to handle small differences in formatting
    const normalizeForCompare = (str: string | null): string => 
      str ? str.trim().toLowerCase() : '';
      
    const artistMatches = normalizeForCompare(cacheItem.query.artist) === normalizeForCompare(artist);
    const songMatches = normalizeForCompare(cacheItem.query.song) === normalizeForCompare(song);
    
    if (!artistMatches || !songMatches) {
      debugLog('Cache key matches but search parameters differ, fetching fresh data');
      needsRefresh = true;
    }
    // Check if cache entry is expired
    else if (now - cacheItem.timestamp > CACHE_EXPIRATION_TIME) {
      debugLog('Cache expired, will fetch fresh data');
      
      // Remove expired item
      const updatedCache: SearchCache = {
        items: cache.items.filter(item => item.key !== key),
        lastQuery: cache.lastQuery
      };
      saveCache(updatedCache);
      
      // Need to fetch fresh data
      needsRefresh = true;
    } 
    // Check if cache is stale and needs a background refresh
    else if (now - cacheItem.timestamp > REFRESH_THRESHOLD) {
      debugLog('Cache is stale, using cached data but refreshing in background');
      
      // Update access count
      cacheItem.accessCount = (cacheItem.accessCount || 0) + 1;
      saveCache(cache);
      
      // Return cached results immediately, but also trigger a refresh
      immediateResults = cacheItem.results;
      needsRefresh = true;
    } else {
      // Cache is still fresh
      debugLog('Using fresh cached search results');
      cacheItem.timestamp = now; // Update timestamp to mark as recently accessed
      cacheItem.accessCount = (cacheItem.accessCount || 0) + 1;
      saveCache(cache);
      
      immediateResults = cacheItem.results;
    }
  } else {
    // No cache entry exists
    needsRefresh = true;
  }
  
  // Create a promise for refreshed data if needed
  const refreshPromise = new Promise<Song[] | null>((resolve) => {
    if (!needsRefresh) {
      debugLog('No refresh needed, using existing results');
      resolve(immediateResults);
      return;
    }
    
    debugLog('Fetching fresh data from API');
    
    // Use a separate async function for the fetch logic
    const fetchData = async () => {
      try {
        // Build the URL for fetching search results with normalized parameters
        // Ensure we're not sending empty strings as parameters
        const backendUrlParams = new URLSearchParams();
        if (artist && artist.trim()) backendUrlParams.append('artist', artist.trim());
        if (song && song.trim()) backendUrlParams.append('song', song.trim());
        
        // Add a timestamp to bust any potential browser cache
        backendUrlParams.append('_t', Date.now().toString());
        
        const backendUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/cifraclub-search?${backendUrlParams.toString()}`;
        
        debugLog(`Making API request to: ${backendUrl}`);
        
        // Use AbortController to handle timeouts
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(backendUrl, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          signal: controller.signal
        });
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch search results: ${response.status} ${response.statusText}`);
        }
        
        const newResults = await response.json();
        debugLog('API returned results:', newResults.length);
        
        // Cache the new results if we actually got data back
        if (Array.isArray(newResults) && newResults.length > 0) {
          cacheSearchResults(artist, song, newResults);
        } else {
          debugLog('API returned empty results, not caching');
        }
        
        // Ensure results are properly formatted as an array
        const resultArray = Array.isArray(newResults) ? newResults : [];
        
        debugLog('API results processed:', { 
          isArray: Array.isArray(newResults), 
          length: resultArray.length,
          results: resultArray
        });
        
        // Always call the callback with the results (even if empty)
        // This ensures that the UI is updated even if there are no results
        if (refreshCallback) {
          debugLog('Calling refresh callback with results:', resultArray.length);
          refreshCallback(resultArray);
        }
        
        resolve(resultArray);
      } catch (error) {
        debugError("Error in background refresh:", error);
        debugLog("VITE_API_URL:", import.meta.env.VITE_API_URL);
        debugLog("URL used:", `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/cifraclub-search?${artist ? `artist=${encodeURIComponent(artist)}` : ''}${song ? `&song=${encodeURIComponent(song)}` : ''}`);
        
        // For explicit errors, don't return cached data
        if (error.name !== 'AbortError') {
          resolve(null);
        } else {
          debugLog('Request timed out, returning cached data if available');
          resolve(immediateResults); // Return cached results if available on timeout
        }
      }
    };
    
    // Execute the fetch immediately - no need for setTimeout
    fetchData();
  });
  
  return {
    immediate: immediateResults,
    refreshPromise
  };
};

/**
 * Utility for debugging: inspect cache
 */
export const inspectSearchCache = () => {
  const cache = initializeCache();
  return cache.items.map(item => ({
    key: item.key,
    artist: item.query.artist,
    song: item.query.song,
    timestamp: item.timestamp,
    accessCount: item.accessCount,
    resultsCount: item.results.length
  }));
};
