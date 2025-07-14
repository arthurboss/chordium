import { Artist } from "@/types/artist";

/**
 * Artist URL Navigation Service
 * 
 * Handles navigation between search results and artist pages
 * Follows SRP: Single responsibility for URL navigation logic
 */
export class ArtistUrlNavigation {
  /**
   * Navigate to artist page when artist is selected from search results
   * 
   * @param artist - The selected artist with path property
   * @param navigate - React Router navigate function
   */
  static navigateToArtist(artist: Artist, navigate: (path: string, options?: { replace?: boolean }) => void): void {
    const artistPath = `/${artist.path}`;
    console.log('[ArtistUrlNavigation] Navigating to artist:', artistPath);
    navigate(artistPath, { replace: true });
  }

  /**
   * Navigate back to search results from artist page
   * 
   * @param searchParams - Original search parameters
   * @param navigate - React Router navigate function
   */
  static navigateBackToSearch(
    searchParams: { artist?: string; song?: string },
    navigate: (path: string, options?: { replace?: boolean }) => void
  ): void {
    const params = new URLSearchParams();
    if (searchParams.artist) params.set('artist', searchParams.artist);
    if (searchParams.song) params.set('song', searchParams.song);
    
    const searchUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('[ArtistUrlNavigation] Navigating back to search:', searchUrl);
    navigate(searchUrl, { replace: true });
  }

  /**
   * Check if current URL is an artist page
   * 
   * @param pathname - Current pathname
   * @returns boolean - True if current URL is an artist page
   */
  static isArtistPage(pathname: string): boolean {
    // Artist pages are direct paths like /jeremy-camp, /ac-dc
    // Exclude known non-artist paths
    const excludedPaths = ['/', '/search', '/upload', '/my-chord-sheets'];
    return !excludedPaths.includes(pathname) && !pathname.startsWith('/my-chord-sheets/');
  }

  /**
   * Extract artist path from URL
   * 
   * @param pathname - Current pathname
   * @returns string | null - Artist path or null if not an artist page
   */
  static extractArtistFromUrl(pathname: string): string | null {
    if (!this.isArtistPage(pathname)) {
      return null;
    }
    
    // Remove leading slash and return the artist path
    return pathname.replace(/^\//, '');
  }
} 