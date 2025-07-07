/**
 * UNIFIED cache key generation for all chord sheet storage
 * 
 * Format: artist_name-song_title
 * - Words within artist/title are separated by underscores (_)
 * - Artist and title are separated by a dash (-)
 * - Diacritics are removed (á → a, ç → c, etc.)
 * - All lowercase
 * - Special characters are removed or normalized
 * 
 * Examples:
 * - "Natiruts", "Quero Ser Feliz Também" → "natiruts-quero_ser_feliz_tambem"
 * - "CPM 22", "Dias Atrás" → "cpm_22-dias_atras"
 * - "AC/DC", "Back in Black" → "ac_dc-back_in_black"
 */

/**
 * Normalizes a string by removing diacritics, converting to lowercase,
 * removing special characters, and replacing spaces with underscores
 */
function normalizeNamePart(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .trim()
    .normalize('NFD') // Decompose diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics (á → a, ç → c, etc.)
    .toLowerCase()
    .replace(/[()[\]{}'"]/g, '') // Remove quotes, parentheses, brackets
    .replace(/[/\\]/g, '_') // Convert slashes to underscores (AC/DC → AC_DC)
    .replace(/[.,;:!?]/g, '') // Remove punctuation
    .replace(/[-\s]+/g, '_') // Replace spaces and hyphens with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/(?:^_+)|(?:_+$)/g, ''); // Remove leading/trailing underscores
}

/**
 * Generates a unified cache key from artist and title
 * This function should be used by ALL parts of the application
 * to ensure consistent ID generation and prevent duplicates
 * 
 * @param artist - Artist name
 * @param title - Song title  
 * @returns Normalized cache key in format: artist_name-song_title
 */
export function generateUnifiedCacheKey(artist: string, title: string): string {
  // Validate inputs
  if (!artist || !title || typeof artist !== 'string' || typeof title !== 'string') {
    console.warn('Invalid artist or title provided to generateUnifiedCacheKey:', { artist, title });
    return '';
  }
  
  const normalizedArtist = normalizeNamePart(artist);
  const normalizedTitle = normalizeNamePart(title);
  
  // Ensure we have valid normalized parts
  if (!normalizedArtist || !normalizedTitle) {
    console.warn('Normalization resulted in empty parts:', { 
      artist, 
      title, 
      normalizedArtist, 
      normalizedTitle 
    });
    return '';
  }
  
  return `${normalizedArtist}-${normalizedTitle}`;
}

// For backward compatibility, but mark as deprecated
/** @deprecated Use generateUnifiedCacheKey instead */
export function generateCacheKey(artist: string, title: string): string {
  return generateUnifiedCacheKey(artist, title);
}

/** @deprecated Use generateUnifiedCacheKey instead */
export function generateChordSheetCacheKey(artist: string, title: string): string {
  return generateUnifiedCacheKey(artist, title);
}
