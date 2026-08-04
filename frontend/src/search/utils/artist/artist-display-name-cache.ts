/**
 * Persists the artist displayName exactly as returned by the search API
 * (e.g. "Florianópolis House Of Prayer (fhop music)"), keyed by artist path,
 * so it can be reused when landing on /:artist later instead of re-deriving
 * a name from DOM scraping or a slug guess.
 *
 * Reuses the existing artist-song searchCache entry (see fetchArtistSongs)
 * rather than a separate store, since that entry is already looked up by
 * the same artist path.
 */
import { SEARCH_TYPES } from "@chordium/types";
import { searchCacheService } from "@/storage/services/search-cache/search-cache-service";
import { getNormalizedSearchCacheKey } from "@/search/utils/normalization/getNormalizedSearchCacheKey";

export async function getStoredArtistDisplayName(artistPath: string): Promise<string | null> {
  try {
    const searchKey = getNormalizedSearchCacheKey(artistPath, "", SEARCH_TYPES.ARTIST_SONG);
    const cached = await searchCacheService.get(searchKey);
    return cached?.search.query.displayName ?? null;
  } catch {
    return null;
  }
}

export async function storeArtistDisplayName(artistPath: string, displayName: string): Promise<void> {
  try {
    const searchKey = getNormalizedSearchCacheKey(artistPath, "", SEARCH_TYPES.ARTIST_SONG);
    const cached = await searchCacheService.get(searchKey);
    await searchCacheService.storeResults({
      searchKey,
      results: cached?.results ?? [],
      search: {
        query: { artist: artistPath, song: "", displayName },
        searchType: SEARCH_TYPES.ARTIST_SONG,
        dataSource: cached?.search.dataSource ?? "neon",
      },
    });
  } catch {
    // Best-effort persistence; failure just means the caller falls back
    // to scraped/slug-derived names on the next visit.
  }
}
