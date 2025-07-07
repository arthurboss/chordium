import { generateUnifiedCacheKey } from '@/storage/utils/unified-cache-key-generator';

/**
 * Generates cache keys following the format: artist_name-song_title
 * - Spaces within artist/title are replaced with underscores
 * - Artist and title are separated by a dash
 * - Diacritics are removed to match CifraClub normalization
 * - All lowercase
 * @deprecated Use generateUnifiedCacheKey directly instead
 */

/**
 * Generates a cache key from artist and title
 * Format: artist_name-song_title
 * 
 * @param artist - Artist name
 * @param title - Song title
 * @returns Normalized cache key string
 * @deprecated Use generateUnifiedCacheKey directly instead
 */
export function generateCacheKey(artist: string, title: string): string {
  return generateUnifiedCacheKey(artist, title);
}
