import { storeChordUrl } from './session-storage-utils';
import { toSlug } from './url-slug-utils';

/**
 * Generic navigation utilities for URL management and route detection
 * Reusable across different parts of the application
 * Follows SRP: Single responsibility of navigation logic
 */
export class NavigationUtils {
  /**
   * Determines if the URL should be updated based on current params vs data
   * 
   * @param data - Data containing artist and song
   * @param currentParams - Current route parameters
   * @returns boolean - True if URL needs updating
   */
  shouldUpdateUrl(
    data: { artist?: string; song?: string }, 
    currentParams: { artist?: string; song?: string }
  ): boolean {
    if (!data.artist || !data.song) return false;

    const artistSlug = toSlug(data.artist);
    const songSlug = toSlug(data.song);

    return currentParams.artist !== artistSlug || currentParams.song !== songSlug;
  }

  /**
   * Generates the navigation path based on context
   * 
   * @param data - Data containing artist and song
   * @param isMyChordSheetsContext - Whether this is in My Chord Sheets context
   * @returns string - The navigation path
   */
  generateNavigationPath(
    data: { artist: string; song: string }, 
    isMyChordSheetsContext: boolean
  ): string {
    const artistSlug = toSlug(data.artist);
    const songSlug = toSlug(data.song);

    return isMyChordSheetsContext
      ? `/my-chord-sheets/${artistSlug}/${songSlug}`
      : `/${artistSlug}/${songSlug}`;
  }

  /**
   * Detects if current path is in My Chord Sheets context
   * 
   * @param pathname - Current window pathname
   * @returns boolean - True if in My Chord Sheets context
   */
  isMyChordSheetsContext(pathname: string): boolean {
    return pathname.startsWith('/my-chord-sheets/');
  }

  /**
   * Performs the complete URL update with navigation and storage
   * 
   * @param data - Data containing artist and song
   * @param currentParams - Current route parameters
   * @param fetchUrl - The URL to store
   * @param navigate - React Router navigate function
   * @param pathname - Current window pathname
   */
  performUrlUpdate(
    data: { artist: string; song: string },
    currentParams: { artist?: string; song?: string },
    fetchUrl: string,
    navigate: (path: string, options?: { replace?: boolean }) => void,
    pathname: string
  ): void {
    if (!this.shouldUpdateUrl(data, currentParams)) return;

    const artistSlug = toSlug(data.artist);
    const songSlug = toSlug(data.song);
    const isMyChordSheets = this.isMyChordSheetsContext(pathname);

    // Store the URL mapping
    storeChordUrl(artistSlug, songSlug, fetchUrl);
    
    // Generate and navigate to new path
    const newPath = this.generateNavigationPath(data, isMyChordSheets);
    navigate(newPath, { replace: true });
  }
}
