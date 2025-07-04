/**
 * Builds a search query key from artist and song parameters
 * This creates a normalized key for cache storage and retrieval
 * 
 * @param artist - Artist name (can be null)
 * @param song - Song name (can be null)
 * @returns Normalized query key or null if invalid
 */
export function buildQueryKey(artist: string | null, song: string | null): string | null {
  if (!artist && !song) {
    return null;
  }

  const artistPart = artist ? artist.toLowerCase().trim() : '';
  const songPart = song ? song.toLowerCase().trim() : '';
  
  if (!artistPart && !songPart) {
    return null;
  }

  return `${artistPart}|${songPart}`;
}
