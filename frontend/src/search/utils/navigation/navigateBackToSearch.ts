/**
 * Navigate back to search results from artist page.
 * 
 * Constructs the appropriate search URL with preserved search parameters
 * and navigates back to the search results page.
 * 
 * @param searchParams - Object containing artist and/or song search parameters
 * @param navigate - React Router navigate function for programmatic navigation
 */
export function navigateBackToSearch(
  searchParams: { artist?: string; song?: string },
  navigate: (path: string, options?: { replace?: boolean }) => void
): void {
  const params = new URLSearchParams();
  if (searchParams.artist) params.set('artist', searchParams.artist);
  if (searchParams.song) params.set('song', searchParams.song);
  
  const queryString = params.toString();
  const searchUrl = queryString ? `/search?${queryString}` : '/search';
  navigate(searchUrl, { replace: true });
}
