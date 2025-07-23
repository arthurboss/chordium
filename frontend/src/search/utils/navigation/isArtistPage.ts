/**
 * Check if current URL is an artist page.
 * 
 * Determines if the given pathname represents an artist page by
 * excluding known non-artist paths and system routes.
 * 
 * @param pathname - The URL pathname to check
 * @returns True if the pathname represents an artist page
 */
export function isArtistPage(pathname: string): boolean {
  // Artist pages are direct paths like /jeremy-camp, /ac-dc
  // Exclude known non-artist paths
  const excludedPaths = ['/', '/search', '/upload', '/my-chord-sheets'];
  return !excludedPaths.includes(pathname) && !pathname.startsWith('/my-chord-sheets/');
}
