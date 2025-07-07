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

  // Normalize by trimming whitespace, removing trailing slashes, and standardizing separators
  const artistPart = artist ? 
    artist.toLowerCase()
          .trim()
          .replace(/\/+$/, '') // Remove trailing slashes
          .replace(/[-\s]+/g, '_') // Replace spaces and hyphens with underscores for consistency
    : '';
  
  const songPart = song ? 
    song.toLowerCase()
        .trim()
        .replace(/\/+$/, '') // Remove trailing slashes
        .replace(/[-\s]+/g, '_') // Replace spaces and hyphens with underscores for consistency
    : '';
  
  if (!artistPart && !songPart) {
    return null;
  }

  return `search_${artistPart}|${songPart}`;
}
