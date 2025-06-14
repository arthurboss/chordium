import { ChordSheetData } from "@/hooks/useChordSheet";

// Key for storing chord sheet cache in localStorage
const CHORD_SHEET_CACHE_KEY = 'chordium-chord-sheet-cache';

// Maximum number of cache entries to keep
const MAX_CACHE_ITEMS = 30;

// Cache expiration time in milliseconds (24 hours)
const CACHE_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

// Import type from centralized types file
import type { CachedChordSheetData } from '../types';

// Interface for cache items
interface CacheItem {
  key: string;
  data: CachedChordSheetData;
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
export const generateChordSheetCacheKey = (artist: string | null, song: string | null): string => {
  // Clean and normalize inputs
  const cleanArtist = artist ? artist.trim().toLowerCase() : null;
  const cleanSong = song ? song.trim().toLowerCase() : null;
  
  // Use null or empty string representation to ensure consistent keys
  const artistKey = cleanArtist === null ? 'null' : (cleanArtist || '');
  const songKey = cleanSong === null ? 'null' : (cleanSong || '');
  
  return `chord:${artistKey}:${songKey}`;
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
        item && item.key && item.data && typeof item.data === 'object'
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
  artist: string | null, 
  song: string | null, 
  data: CachedChordSheetData
): void => {
  const cache = initializeCache();
  const key = generateChordSheetCacheKey(artist, song);
  
  // Look for existing entry to preserve access count
  const existingItem = cache.items.find(item => item.key === key);
  const accessCount = existingItem ? existingItem.accessCount + 1 : 1;
  
  // Make sure we strip any timestamp from the data itself
  const { timestamp, ...cleanData } = data;
  
  // Remove any existing entry with the same key
  const filteredItems = cache.items.filter(item => item.key !== key);
  
  // Add the new entry
  let newItems = [
    ...filteredItems,
    {
      key,
      data: cleanData,
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
export const getCachedChordSheet = (artist: string | null, song: string | null): CachedChordSheetData | null => {
  const cache = initializeCache();
  const key = generateChordSheetCacheKey(artist, song);
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
  
  // Add timestamp to the returned data
  const cachedData = {
    ...cacheItem.data,
    timestamp: cacheItem.timestamp
  };
  
  return cachedData;
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
 * Get cached chord sheet with conditional background refresh
 * If sheet is stale (24-hour threshold), display cache but refresh in background
 * @returns An object containing the cached data and a promise for potentially refreshed data
 */
export const getChordSheetWithRefresh = async (
  artist: string | null, 
  song: string | null,
  fetchUrl: string,
  refreshCallback?: (newData: CachedChordSheetData) => void
): Promise<{
  immediate: CachedChordSheetData | null;
  refreshPromise: Promise<CachedChordSheetData | null>;
}> => {
  const cachedData = getCachedChordSheet(artist, song);
  
  // Threshold for "stale" data that needs a background refresh (24 hours)
  const REFRESH_THRESHOLD = 24 * 60 * 60 * 1000;
  
  let needsRefresh = false;
  
  if (cachedData) {
    // We have cached data to use
    const now = Date.now();
    const cacheTime = cachedData.timestamp || 0; // Default to 0 if somehow missing
    
    // Check if the data is stale and needs background refresh
    if (now - cacheTime > REFRESH_THRESHOLD) {
      console.log('Chord sheet is stale, showing cached version but refreshing in background');
      needsRefresh = true;
    } else {
      console.log('Using fresh cached chord sheet');
    }
  } else {
    // No cached data
    console.log('No cached chord sheet available, must fetch');
    needsRefresh = true;
  }
  
  // Create a promise for refreshed data if needed
  const refreshPromise = new Promise<CachedChordSheetData | null>((resolve) => {
    if (!needsRefresh) {
      resolve(cachedData);
      return;
    }
    
    // Use a separate async function for the fetch logic
    const fetchData = async () => {
      try {
        console.log('🌐 FRONTEND FETCH START: Fetching chord sheet from backend');
        console.log('📊 Flow Step 4: Frontend making API call to backend');
        console.log('📋 Request details:', { fetchUrl, timestamp: new Date().toISOString() });
        
        const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/cifraclub-chord-sheet?url=${encodeURIComponent(fetchUrl)}`;
        console.log('🔗 API URL:', apiUrl);
        
        // Use AbortController to implement timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        const response = await fetch(apiUrl, {
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
          throw new Error(`Failed to fetch chord sheet: ${response.statusText}`);
        }
        
        console.log('✅ Flow Step 5: Backend response received successfully');
        const data = await response.json();
        
        console.log('📦 Backend response structure:', {
          hasContent: !!data.content,
          hasError: !!data.error,
          hasCapo: !!data.capo,
          hasTuning: !!data.tuning,
          hasKey: !!data.key,
          hasArtist: !!data.artist,
          hasSong: !!data.song,
          contentLength: data.content ? data.content.length : 0
        });
        
        console.log('⚠️  LIMITATION: Backend response minimal - only contains content field');
        
        if (data.error) {
          throw new Error(`Backend error: ${data.error}`);
        }
        
        if (!data.content) {
          throw new Error('No chord sheet content found');
        }
        
        console.log('🔄 Flow Step 6: Constructing cache entry with available data');
        const freshData = {
          content: data.content || '',
          capo: data.capo || '',
          tuning: data.tuning || '',
          key: data.key || '',
          artist: data.artist || '',
          song: data.song || '',
          originalUrl: fetchUrl,
          timestamp: Date.now() // Add a timestamp for future staleness checks
        };
        
        console.log('💾 Flow Step 7: Caching chord sheet data');
        console.log('🔑 Cache details:', {
          artist,
          song,
          hasContent: !!freshData.content,
          contentLength: freshData.content.length
        });
        
        // Cache the new data
        cacheChordSheet(artist, song, freshData);
        
        console.log('✅ Flow Step 8: Chord sheet cached successfully');
        resolve(freshData);
      } catch (error) {
        console.error('❌ Error in fetchData:', error);
        resolve(null);
      }
    };
    
    // Execute the fetch
    fetchData();
  });

  return {
    immediate: cachedData,
    refreshPromise
  };
};
