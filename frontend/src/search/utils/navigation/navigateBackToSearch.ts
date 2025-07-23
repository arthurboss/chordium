/**
 * Navigate back to search results from artist page
 * Single responsibility: Search results navigation
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
