import { NavigationUtils } from '../../utils/navigation-utils';

/**
 * Background refresh handler for useChordSheet hook
 * Hook-specific: handles background refresh logic and URL updates
 * Follows SRP: Single responsibility of background refresh coordination
 */
export class BackgroundRefreshHandler {
  constructor(private navigationUtils: NavigationUtils) {}

  /**
   * Handles background refresh completion
   * 
   * @param updatedData - Updated chord sheet data from refresh
   * @param fetchUrl - Original fetch URL
   * @param params - Current route parameters
   * @param setChordData - State setter function
   * @param navigate - React Router navigate function
   */
  handleBackgroundRefresh(
    updatedData: any,
    fetchUrl: string,
    params: { artist?: string; song?: string },
    setChordData: (data: any) => void,
    navigate: (path: string, options?: { replace?: boolean }) => void
  ): void {
    
    // Update URL if needed
    this.updateUrlIfNeeded(updatedData, fetchUrl, params, navigate);
    
    // Update chord data
    setChordData({
      ...updatedData,
      loading: false,
      error: null,
    });
  }

  /**
   * Updates URL if the background refresh changed artist/song data
   * 
   * @param data - Updated chord sheet data
   * @param fetchUrl - Original fetch URL
   * @param params - Current route parameters
   * @param navigate - React Router navigate function
   */
  private updateUrlIfNeeded(
    data: any,
    fetchUrl: string,
    params: { artist?: string; song?: string },
    navigate: (path: string, options?: { replace?: boolean }) => void
  ): void {
    if (!data.artist || !data.song) return;

    this.navigationUtils.performUrlUpdate(
      data,
      params,
      fetchUrl,
      navigate,
      window.location.pathname
    );
  }
}
