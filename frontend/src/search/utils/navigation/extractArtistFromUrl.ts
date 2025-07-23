/**
 * Extract artist path from URL
 * Single responsibility: Artist path extraction from URL
 */
import { isArtistPage } from './isArtistPage';

export function extractArtistFromUrl(pathname: string): string | null {
  if (!isArtistPage(pathname)) {
    return null;
  }
  
  // Remove leading slash and return the artist path
  return pathname.replace(/^\//, '');
}
