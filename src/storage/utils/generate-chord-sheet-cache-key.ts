import { generateUnifiedCacheKey } from './unified-cache-key-generator';

/**
 * Generate cache key for chord sheet storage
 * Follows SRP: Single responsibility for cache key generation
 * @param artist - Artist name
 * @param title - Song title
 * @returns Normalized cache key
 * @deprecated Use generateUnifiedCacheKey directly instead
 */
export function generateChordSheetCacheKey(artist: string, title: string): string {
  return generateUnifiedCacheKey(artist, title);
}
