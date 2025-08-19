import { normalizeForSearch } from "../";

/**
 * Generates a normalized cache key for search cache operations.
 * Always use this to build the cache key from artist, song, and searchType input.
 */
export function getNormalizedSearchCacheKey(
  artist: string,
  song: string,
  searchType: string
): string {
  const normArtist = normalizeForSearch(artist || "");
  const normSong = normalizeForSearch(song || "");
  const normType = normalizeForSearch(searchType || "");
  return `${normArtist}|${normSong}|${normType}`;
}
