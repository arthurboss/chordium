import { generateChordSheetCacheKey } from '@/storage/utils/generate-chord-sheet-cache-key';

/**
 * Generates a normalized cache key from artist and title
 * This creates a consistent key format for storing and retrieving chord sheets
 * 
 * @param artist - Artist name
 * @param title - Song title
 * @returns Normalized cache key
 */
export function generateCacheKey(artist: string, title: string): string {
  return generateChordSheetCacheKey(artist, title);
}
