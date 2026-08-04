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
    if (import.meta.env.DEV) {
      console.error("Invalid artist path: empty string");
    }
    throw new Error("Invalid artist path");
  }

  // Use normalized searchKey for cache
  const searchKey = getNormalizedSearchCacheKey(artistPath, "", SEARCH_TYPES.ARTIST_SONG);
  const cachedEntry = await searchCacheService.get(searchKey);
  if (
    cachedEntry &&
    cachedEntry.search.searchType === SEARCH_TYPES.ARTIST_SONG &&
    cachedEntry.results.length > 0
  ) {
    // A displayName-only entry (written by storeArtistDisplayName before any
    // songs were fetched) has empty results - fall through to fetch songs
    // rather than treating it as "this artist has zero songs".
    return cachedEntry.results as Song[];
  }

  const apiUrl = `${getApiBaseUrl()}/api/artist-songs?artistPath=${encodeURIComponent(artistPath)}`;
  try {
    const resp = await fetch(apiUrl);
    if (!resp.ok) {
      const errorText = await resp.text();
      if (import.meta.env.DEV) {
        console.error(`API error (${resp.status}): ${errorText}`);
      }
      throw new Error(`${resp.statusText} (${resp.status}): ${errorText}`);
    }
    const data: Song[] = await resp.json();
    // Only cache non-empty results
    if (data.length > 0) {
      // Re-read the cache instead of reusing the entry fetched before the
      // network call above: storeArtistDisplayName (fired when the artist was
      // clicked) can write in the meantime, and using the stale read here
      // would overwrite that displayName with undefined.
      const latestEntry = await searchCacheService.get(searchKey);
      await searchCacheService.storeResults({
        searchKey,
        results: data,
        search: {
          // Preserve a displayName already cached by storeArtistDisplayName
          // (e.g. from clicking this artist in search results) so fetching
          // the song list doesn't clobber it.
          query: { artist: artistPath, song: "", displayName: latestEntry?.search.query.displayName },
          searchType: SEARCH_TYPES.ARTIST_SONG,
          dataSource: "neon",
        },
      });
    }
    return data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Error fetching artist songs:", error);
    }
    throw error;
  }
}
