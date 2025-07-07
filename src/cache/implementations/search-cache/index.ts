import { Song } from "@/types/song";
import { Artist } from "@/types/artist";
import { SearchCacheIndexedDB } from './search-cache-class';

// Create a singleton instance
export const searchCacheIndexedDB = new SearchCacheIndexedDB();

// Union type for search results
export type SearchResultData = Song[] | Artist[];

// Export convenience functions for the search cache
export const cacheSearchResults = async (artist: string | null, song: string | null, results: SearchResultData) => 
  await searchCacheIndexedDB.cacheSearchResults(artist, song, results);

export const getCachedSearchResults = async (artist: string | null, song: string | null) => 
  await searchCacheIndexedDB.getCachedSearchResults(artist, song);

export const clearSearchCache = async () => 
  await searchCacheIndexedDB.clearAllCache();

export const clearExpiredSearchCache = async () => 
  await searchCacheIndexedDB.clearExpiredEntries();

// Export the main class
export { SearchCacheIndexedDB };
