// Utility functions for artist-related logic
import { Song } from "@/types/song";
import { SearchCacheIndexedDB } from "@/cache/implementations/search-cache/search-cache-class";

// Create a singleton instance for artist searches
const searchCache = new SearchCacheIndexedDB();

export function extractArtistSlug(artistUrl: string): string | null {
  try {
    const url = new URL(artistUrl);
    const slug = url.pathname.replace(/^(\/+)|(\/+)$/g, '').split('/')[0];
    return slug || null;
  } catch {
    return null;
  }
}

export async function fetchArtistSongs(artistPath: string): Promise<Song[]> {
  if (!artistPath) {
    console.error('Invalid artist path: empty string');
    throw new Error('Invalid artist path');
  }

  // Try to get cached results first (async)
  // For artist searches, we use artistPath as the artist name and null for song
  const cachedResults = await searchCache.getCachedSearchResults(artistPath, null);
  
  // Type guard: ensure we have Song[] (artist song listings)
  if (cachedResults && Array.isArray(cachedResults) && cachedResults.length > 0) {
    // Check if first item has properties typical of Song (not Artist)
    const firstItem = cachedResults[0];
    if ('title' in firstItem && 'path' in firstItem) {
      const cachedSongs = cachedResults as Song[];
      console.log(`🎯 CACHE HIT: Using cached songs for artist: ${artistPath} (${cachedSongs.length} songs)`);
      return cachedSongs;
    }
  }

  console.log(`🌐 CACHE MISS: Fetching songs for artist path: ${artistPath}`);
  const apiUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/artist-songs?artistPath=${encodeURIComponent(artistPath)}`;
  console.log(`API URL: ${apiUrl}`);
  
  try {
    const resp = await fetch(apiUrl);
    
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`API error (${resp.status}): ${errorText}`);
      throw new Error(`${resp.statusText} (${resp.status}): ${errorText}`);
    }
    
    const data: Song[] = await resp.json();
    console.log(`Received ${data.length} songs for artist ${artistPath}`);
    
    // Cache the results for future use (async)
    console.log(`💾 CACHING: Saving ${data.length} songs for artist: ${artistPath}`);
    await searchCache.cacheSearchResults(artistPath, null, data);
    
    // Return the data as-is (Song objects with title and path)
    return data;
  } catch (error) {
    console.error('Error fetching artist songs:', error);
    throw error;
  }
}
