/**
 * Key extraction utilities
 */

/**
 * Extracts artist path from a song path key
 * @param songPath - Song path in format "artist-path/song-path"
 * @returns Artist path or null if invalid format
 */
export function extractArtistPath(songPath: string): string | null {
  const parts = songPath.split('/');
  return parts.length === 2 ? parts[0] : null;
}

/**
 * Extracts song name from a song path key
 * @param songPath - Song path in format "artist-path/song-path"
 * @returns Song path or null if invalid format
 */
export function extractSongPath(songPath: string): string | null {
  const parts = songPath.split('/');
  return parts.length === 2 ? parts[1] : null;
}
