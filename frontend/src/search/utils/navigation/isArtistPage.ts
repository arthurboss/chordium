/**
 * Check if current URL is an artist page
 * Single responsibility: Artist page URL detection
 */
export function isArtistPage(pathname: string): boolean {
  // Artist pages are direct paths like /jeremy-camp, /ac-dc
  // Exclude known non-artist paths
  const excludedPaths = ['/', '/search', '/upload', '/my-chord-sheets'];
  return !excludedPaths.includes(pathname) && !pathname.startsWith('/my-chord-sheets/');
}
