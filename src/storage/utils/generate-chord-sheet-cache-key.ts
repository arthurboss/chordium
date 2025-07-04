/**
 * Generate cache key for chord sheet storage
 * Follows SRP: Single responsibility for cache key generation
 * @param artist - Artist name
 * @param title - Song title
 * @returns Normalized cache key
 */
export function generateChordSheetCacheKey(artist: string, title: string): string {
  const normalizeString = (str: string): string => {
    return str
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const normalizedArtist = normalizeString(artist);
  const normalizedTitle = normalizeString(title);
  
  return `${normalizedArtist}_${normalizedTitle}`;
}
