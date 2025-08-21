/**
 * Extracts artist and song information from a chord sheet storage path
 * 
 * @param path - Storage path in format "artist/song" 
 * @returns Object with artist and song, or null if path is invalid
 */
export function parseChordSheetPath(path: string): { artist: string; song: string } | null {
  if (!path || typeof path !== 'string') {
    return null;
  }

  // Remove any leading slash and split by forward slash
  const cleanPath = path.replace(/^\/+/, '');
  const parts = cleanPath.split('/');
  
  if (parts.length !== 2) {
    return null;
  }

  const [artist, song] = parts;
  
  if (!artist || !song) {
    return null;
  }

  return {
    artist: artist.trim(),
    song: song.trim()
  };
}
