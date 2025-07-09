/**
 * Generates cache keys following the format: artist_name-song_title
 * - Spaces within artist/title are replaced with underscores
 * - Artist and title are separated by a dash
 * - Diacritics are removed to match CifraClub normalization
 * - All lowercase
 */

/**
 * Normalizes a string by removing diacritics, converting to lowercase,
 * removing certain special characters, and replacing spaces with underscores
 */
function normalizeNamePart(text: string): string {
  // Ensure text is a string and has content
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .replace(/[()[\]{}]/g, '') // Remove parentheses and brackets
    .replace(/\./g, '') // Remove periods
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single underscore
    .replace(/(^_+)|(_+$)/g, ''); // Remove leading/trailing underscores
}

/**
 * Generates a cache key from artist and title
 * Format: artist_name-song_title
 * 
 * @param artist - Artist name
 * @param title - Song title
 * @returns Normalized cache key string
 */
export function generateCacheKey(artist: string, title: string): string {
  // Validate inputs
  if (!artist || !title || typeof artist !== 'string' || typeof title !== 'string') {
    console.warn('Invalid artist or title provided to generateCacheKey:', { artist, title });
    return '';
  }
  
  const normalizedArtist = normalizeNamePart(artist);
  const normalizedTitle = normalizeNamePart(title);
  
  return `${normalizedArtist}-${normalizedTitle}`;
}
