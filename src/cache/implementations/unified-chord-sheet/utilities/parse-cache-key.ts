/**
 * Parses a cache key back to artist and title components
 * This utility function extracts the original artist and title from a cache key
 * 
 * @param cacheKey - Cache key to parse (format: "artist-title")
 * @returns Object with artist and title
 */
export function parseCacheKeyToComponents(cacheKey: string): { artist: string; title: string } {
  // Split on the first hyphen to handle cases where title might contain hyphens
  const hyphenIndex = cacheKey.indexOf('-');
  
  if (hyphenIndex === -1) {
    // Fallback if no hyphen found
    return { artist: cacheKey, title: '' };
  }
  
  const artist = cacheKey.substring(0, hyphenIndex);
  const title = cacheKey.substring(hyphenIndex + 1);
  
  return { artist, title };
}
