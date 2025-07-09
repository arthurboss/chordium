/**
 * Parses a cache key back into artist and title components
 * 
 * @param key - Cache key in format artist_name-song_title
 * @returns Object with artist and title, with underscores converted back to spaces
 */
export function parseCacheKey(key: string): { artist: string; title: string } {
  const dashIndex = key.lastIndexOf('-');
  
  if (dashIndex === -1) {
    // No dash found, treat entire string as title
    return {
      artist: 'Unknown Artist',
      title: key.replace(/_/g, ' ')
    };
  }
  
  const artistPart = key.substring(0, dashIndex);
  const titlePart = key.substring(dashIndex + 1);
  
  return {
    artist: artistPart.replace(/_/g, ' '),
    title: titlePart.replace(/_/g, ' ')
  };
}
