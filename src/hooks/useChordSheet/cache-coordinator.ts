import { ChordSheet } from '@/types/chordSheet';
import { clearExpiredCacheFromIndexedDB } from './coordinators/clear-expired-cache-indexeddb';
import { getChordSheetDataFromIndexedDB } from './coordinators/get-chord-sheet-data-indexeddb';

/**
 * Cache coordination for useChordSheet hook using IndexedDB
 * Hook-specific: handles cache operations and refresh logic
 * Follows SRP: Single responsibility of cache interaction
 */
export class CacheCoordinator {
  /**
   * Clears expired cache entries from IndexedDB
   */
  async clearExpiredCache(): Promise<void> {
    await clearExpiredCacheFromIndexedDB();
  }

  /**
   * Gets chord sheet data, checking IndexedDB cache first then fetching if needed
   * 
   * @param storageKey - Combined storage key (artist_name-song_title)
   * @param fetchUrl - URL to fetch from if not cached
   * @returns Promise with chord sheet data or null if failed
   */
  async getChordSheetData(
    storageKey: string,
    fetchUrl: string
  ): Promise<ChordSheet | null> {
    return await getChordSheetDataFromIndexedDB(storageKey, fetchUrl);
  }
}
