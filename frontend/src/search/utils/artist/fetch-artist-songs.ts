/**
 * Fetches the list of songs for a given artist path, using cache if available.
 *
 * @param artistPath - The path identifier for the artist
 * @returns Promise resolving to an array of Song objects
 * @throws Error if the artist path is invalid or the API call fails
 */
import { SEARCH_TYPES, type Song } from "@chordium/types";
import { searchCacheService } from "@/storage/services/search-cache/search-cache-service";
import { getApiBaseUrl } from "@/utils/api-base-url";
import { getNormalizedSearchCacheKey } from "@/search/utils/normalization/getNormalizedSearchCacheKey";

export async function fetchArtistSongs(artistPath: string): Promise<Song[]> {
  if (!artistPath) {
    console.error("Invalid artist path: empty string");
    throw new Error("Invalid artist path");
  }

  // Use normalized searchKey for cache
  const searchKey = getNormalizedSearchCacheKey(artistPath, "", SEARCH_TYPES.ARTIST_SONG);
  const cachedEntry = await searchCacheService.get(searchKey);
  if (
    cachedEntry &&
    cachedEntry.search.searchType === SEARCH_TYPES.ARTIST_SONG
  ) {
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
    // Cache the results for future use (use normalized searchKey)
    await searchCacheService.storeResults({
      searchKey,
      results: data,
      search: {
        query: { artist: artistPath, song: "" },
        searchType: SEARCH_TYPES.ARTIST_SONG,
        dataSource: "s3",
      },
    });
    return data;
  } catch (error) {
    console.error("Error fetching artist songs:", error);
    throw error;
  }
}
