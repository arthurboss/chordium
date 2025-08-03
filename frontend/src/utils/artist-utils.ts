// Utility functions for artist-related logic
import { SEARCH_TYPES, Song } from "@/types/song";
import { searchCacheService } from "@/storage/services/search-cache/search-cache-service";
import { getApiBaseUrl } from './api-base-url';

export function extractArtistSlug(artistUrl: string): string | null {
  try {
    const url = new URL(artistUrl);
    const slug = url.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
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

  // Try to get cached results first
  const cachedEntry = await searchCacheService.get(artistPath);
  if (cachedEntry && cachedEntry.search.searchType === SEARCH_TYPES.ARTIST_SONG) {
    return cachedEntry.results as Song[];
  }

  const apiUrl = `${getApiBaseUrl()}/api/artist-songs?artistPath=${encodeURIComponent(artistPath)}`;
  
  try {
    const resp = await fetch(apiUrl);
    
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error(`API error (${resp.status}): ${errorText}`);
      throw new Error(`${resp.statusText} (${resp.status}): ${errorText}`);
    }
    
    const data: Song[] = await resp.json();
    
    // Cache the results for future use
    await searchCacheService.storeResults({
      path: artistPath,
      results: data,
      search: {
        query: { artist: artistPath, song: null },
        searchType: SEARCH_TYPES.ARTIST_SONG,
        dataSource: 's3',
      }
    });
    
    // Return the data as-is (Song objects with title and path)
    return data;
  } catch (error) {
    console.error('Error fetching artist songs:', error);
    throw error;
  }
}
