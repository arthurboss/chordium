import { generateUnifiedCacheKey } from '@/storage/utils/unified-cache-key-generator';

/**
 * Generates chord sheet IDs following the format: artist_name-song_title
 * - Spaces within artist/title are replaced with underscores
 * - Artist and title are separated by a dash
 * - Diacritics are removed to match CifraClub normalization
 * - All lowercase
 * 
 * @deprecated Use generateUnifiedCacheKey directly instead
 */

/**
 * Normalizes a string by removing diacritics, converting to lowercase,
 * removing certain special characters, and replacing spaces with underscores
 * 
 * @deprecated Use generateUnifiedCacheKey directly instead
 */
function normalizeNamePart(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .replace(/[()[\]{}]/g, '') // Remove parentheses and brackets
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single underscore
    .replace(/(^_+)|(_+$)/g, ''); // Remove leading/trailing underscores
}

/**
 * Generates a chord sheet ID from artist and title
 * Format: artist_name-song_title
 * 
 * @param artist - Artist name
 * @param title - Song title
 * @returns Normalized ID string
 * @deprecated Use generateUnifiedCacheKey directly instead
 */
export function generateChordSheetId(artist: string, title: string): string {
  console.warn('generateChordSheetId is deprecated. Use generateUnifiedCacheKey instead.');
  return generateUnifiedCacheKey(artist, title);
}

/**
 * Parses a chord sheet ID back into artist and title components
 * 
 * @param id - Chord sheet ID in format artist_name-song_title
 * @returns Object with artist and title, with underscores converted back to spaces
 */
export function parseChordSheetId(id: string): { artist: string; title: string } {
  const dashIndex = id.lastIndexOf('-');
  
  if (dashIndex === -1) {
    // No dash found, treat entire string as title
    return {
      artist: 'Unknown Artist',
      title: id.replace(/_/g, ' ')
    };
  }
  
  const artistPart = id.substring(0, dashIndex);
  const titlePart = id.substring(dashIndex + 1);
  
  return {
    artist: artistPart.replace(/_/g, ' '),
    title: titlePart.replace(/_/g, ' ')
  };
}
