import {
  clearExpiredChordSheetCache,
  getChordSheetWithRefresh,
} from '../../cache/implementations/chord-sheet-cache';

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
    clearExpiredChordSheetCache();
  }

  /**
   * Gets chord sheet with conditional refresh
   * 
   * @param artist - Artist name (can be null)
   * @param song - Song name (can be null)
   * @param fetchUrl - URL to fetch from
   * @param backgroundHandler - Handler for background refresh
   * @returns Promise with immediate data and refresh promise
   */
  async getChordSheetWithRefresh(
    artist: string | null,
    song: string | null,
    fetchUrl: string,
    backgroundHandler: (updatedData: any) => void
  ): Promise<{ immediate: any; refreshPromise: Promise<any> }> {
    return await getChordSheetWithRefresh(
      artist,
      song,
      fetchUrl,
      backgroundHandler
    );
  }
}
