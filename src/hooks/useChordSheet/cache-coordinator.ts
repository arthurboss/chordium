import { ChordSheet } from '@/types/chordSheet';
import { clearExpiredCache } from './coordinators/clear-expired-cache';
import { getChordSheetData } from './coordinators/get-chord-sheet-data';

/**
 * Cache coordination for useChordSheet hook
 * Hook-specific: handles cache operations and refresh logic
 * Follows SRP: Single responsibility of cache interaction
 */
export class CacheCoordinator {
  /**
   * Clears expired cache entries
   */
  clearExpiredCache(): void {
    clearExpiredCache();
  }

  /**
   * Gets chord sheet data, checking cache first then fetching if needed
   * 
   * @param storageKey - Combined storage key (artist_name-song_title)
   * @param fetchUrl - URL to fetch from if not cached
   * @returns Promise with chord sheet data or null if failed
   */
  async getChordSheetData(
    storageKey: string,
    fetchUrl: string
  ): Promise<ChordSheet | null> {
    return await getChordSheetData(storageKey, fetchUrl);
  }
}
