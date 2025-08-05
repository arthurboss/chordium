/**
 * Fetches the list of songs for a given artist path, using cache if available.
 *
 * @param artistPath - The path identifier for the artist
 * @returns Promise resolving to an array of Song objects
 * @throws Error if the artist path is invalid or the API call fails
 */
import type { Song } from "@/types/song";
import { SEARCH_TYPES } from "@/types/song";
import { searchCacheService } from "@/storage/services/search-cache/search-cache-service";
import { getApiBaseUrl } from "@/utils/api-base-url";

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
    return data;
  } catch (error) {
    console.error('Error fetching artist songs:', error);
    throw error;
  }
}
