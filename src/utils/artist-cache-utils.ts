import { SongData } from "@/types/song";

// Key for storing artist songs cache in sessionStorage
const ARTIST_SONGS_CACHE_KEY = 'chordium-artist-songs-cache';

// Maximum number of cache entries to keep
const MAX_CACHE_ITEMS = 15;

// Cache expiration time in milliseconds (1 hour)
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

// Interface for cache items
interface ArtistCacheItem {
  artistUrl: string;
  songs: SongData[];
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
    const cache = sessionStorage.getItem(ARTIST_SONGS_CACHE_KEY);
    return cache ? JSON.parse(cache) : { items: [] };
  } catch (e) {
    console.error('Failed to parse artist songs cache:', e);
    return { items: [] };
  }
};

/**
 * Save the artist songs cache to sessionStorage
 */
const saveCache = (cache: ArtistCache): void => {
  try {
    sessionStorage.setItem(ARTIST_SONGS_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.error('Failed to save artist songs cache:', e);
  }
};

/**
 * Save artist songs to the cache
 */
export const cacheArtistSongs = (
  artistUrl: string,
  songs: SongData[]
): void => {
  const cache = initializeCache();
  
  // Look for existing entry to preserve access count
  const existingItem = cache.items.find(item => item.artistUrl === artistUrl);
  const accessCount = existingItem ? existingItem.accessCount + 1 : 1;
  
  // Extract artist name from first song if available
  const artistName = songs.length > 0 ? songs[0].artist : undefined;
  
  // Remove any existing entry with the same artist URL
  const filteredItems = cache.items.filter(item => item.artistUrl !== artistUrl);
  
  // Add the new entry
  let newItems = [
    ...filteredItems,
    {
      artistUrl,
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
export const getCachedArtistSongs = (artistUrl: string): SongData[] | null => {
  const cache = initializeCache();
  const cacheItem = cache.items.find(item => item.artistUrl === artistUrl);
  
  if (!cacheItem) return null;
  
  // Check if cache entry is expired
  const now = Date.now();
  if (now - cacheItem.timestamp > CACHE_EXPIRATION_TIME) {
    console.log('Artist cache expired, will fetch fresh data');
    
    // Remove expired item
    const updatedCache: ArtistCache = {
      items: cache.items.filter(item => item.artistUrl !== artistUrl)
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
    sessionStorage.removeItem(ARTIST_SONGS_CACHE_KEY);
  } catch (e) {
    console.error('Failed to clear artist songs cache:', e);
  }
};
