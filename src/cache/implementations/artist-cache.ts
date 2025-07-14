import { Song } from "@/types/song";

// Key for storing artist songs cache in localStorage (changed from sessionStorage for persistence)
const ARTIST_SONGS_CACHE_KEY = 'chordium-artist-songs-cache';

// Maximum number of cache entries to keep
const MAX_CACHE_ITEMS = 20;

// Cache expiration time in milliseconds (4 hours)
const CACHE_EXPIRATION_TIME = 4 * 60 * 60 * 1000;

// Interface for cache items
interface ArtistCacheItem {
  artistPath: string;
  songs: Song[];
  timestamp: number;
  accessCount: number;
  artistName?: string; // Optional: store artist name for better management
}

// Interface for the entire cache
interface ArtistCache {
  items: ArtistCacheItem[];
}

/**
 * Initialize the artist songs cache
 */
const initializeCache = (): ArtistCache => {
  try {
    const cache = localStorage.getItem(ARTIST_SONGS_CACHE_KEY);
    return cache ? JSON.parse(cache) : { items: [] };
  } catch (e) {
    console.error('Failed to parse artist songs cache:', e);
    return { items: [] };
  }
};

/**
 * Save the artist songs cache to localStorage
 */
const saveCache = (cache: ArtistCache): void => {
  try {
    localStorage.setItem(ARTIST_SONGS_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to save artist songs cache:', e);
  }
};

/**
 * Save artist songs to the cache
 */
export const cacheArtistSongs = (
  artistPath: string,
  songs: Song[]
): void => {
  const cache = initializeCache();
  
  // Look for existing entry to preserve access count
  const existingItem = cache.items.find(item => item.artistPath === artistPath);
  const accessCount = existingItem ? existingItem.accessCount + 1 : 1;
  
  // Extract artist name from path if available (for better management)
  const artistName = artistPath.split('/').pop() || undefined;
  
  // Remove any existing entry with the same artist path
  const filteredItems = cache.items.filter(item => item.artistPath !== artistPath);
  
  // Add the new entry
  let newItems = [
    ...filteredItems,
    {
      artistPath,
      songs,
      timestamp: Date.now(),
      accessCount,
      artistName
    }
  ];
  
  // If we exceed max cache size, remove least valuable items
  if (newItems.length > MAX_CACHE_ITEMS) {
    // Sort by a combined score of recency and access count
    newItems.sort((a, b) => {
      // Calculate a score based on access count and timestamp
      const scoreA = a.accessCount * 0.7 + (a.timestamp / Date.now()) * 0.3;
      const scoreB = b.accessCount * 0.7 + (b.timestamp / Date.now()) * 0.3;
      return scoreA - scoreB; // Sort ascending, so lowest scores are first to be removed
    });
    
    // Remove items until we're at the limit
    newItems = newItems.slice(newItems.length - MAX_CACHE_ITEMS);
  }
  
  const newCache: ArtistCache = {
    items: newItems
  };
  
  saveCache(newCache);
};

/**
 * Get cached artist songs if they exist
 * @returns The cached songs or null if not found or expired
 */
export const getCachedArtistSongs = (artistPath: string): Song[] | null => {
  const cache = initializeCache();
  const cacheItem = cache.items.find(item => item.artistPath === artistPath);
  
  if (!cacheItem) return null;
  
  // Check if cache entry is expired
  const now = Date.now();
  if (now - cacheItem.timestamp > CACHE_EXPIRATION_TIME) {
    console.log('Artist cache expired, will fetch fresh data');
    
    // Remove expired item
    const updatedCache: ArtistCache = {
      items: cache.items.filter(item => item.artistPath !== artistPath)
    };
    saveCache(updatedCache);
    
    return null;
  }
  
  // Update the timestamp and increment access count
  cacheItem.timestamp = now;
  cacheItem.accessCount = (cacheItem.accessCount || 0) + 1;
  saveCache(cache);
  
  return cacheItem.songs;
};

/**
 * Clear all expired cache entries
 * @returns The number of entries removed
 */
export const clearExpiredArtistCache = (): number => {
  const cache = initializeCache();
  const now = Date.now();
  
  const initialCount = cache.items.length;
  cache.items = cache.items.filter(item => now - item.timestamp <= CACHE_EXPIRATION_TIME);
  const removedCount = initialCount - cache.items.length;
  
  if (removedCount > 0) {
    console.log(`Removed ${removedCount} expired artist cache entries`);
    saveCache(cache);
  }
  
  return removedCount;
};

/**
 * Clear all cached artist songs
 */
export const clearArtistSongsCache = (): void => {
  try {
    localStorage.removeItem(ARTIST_SONGS_CACHE_KEY);
  } catch (e) {
    console.error('Failed to clear artist songs cache:', e);
  }
};

/**
 * Utility for debugging: inspect artist cache
 */
export const inspectArtistCache = () => {
  const cache = initializeCache();
  return cache.items.map(item => ({
    artistPath: item.artistPath,
    artistName: item.artistName,
    timestamp: item.timestamp,
    accessCount: item.accessCount,
    songsCount: item.songs.length
  }));
};
