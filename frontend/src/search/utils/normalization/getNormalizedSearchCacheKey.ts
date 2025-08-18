import { normalizeForSearch } from "../";

/**
 * Generates a normalized cache key for search cache operations.
 * Always use this to build the cache key from artist/song input.
 */
export function getNormalizedSearchCacheKey(
  artist: string,
  song: string
): string {
  const normArtist = normalizeForSearch(artist || "");
  const normSong = normalizeForSearch(song || "");
  if (!normArtist && normSong) return normSong;
  if (normArtist && !normSong) return normArtist;
  if (normArtist && normSong) return normArtist; // For artist+song, use artist as key (matches current logic)
  return "";
}
