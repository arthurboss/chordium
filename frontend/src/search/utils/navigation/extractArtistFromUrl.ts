/**
 * Extract artist path from URL.
 * 
 * Parses a URL pathname to extract the artist identifier,
 * returning null if the URL doesn't represent an artist page.
 * 
 * @param pathname - The URL pathname to parse
 * @returns The artist path/identifier, or null if not an artist page
 */
import { isArtistPage } from './isArtistPage';

export function extractArtistFromUrl(pathname: string): string | null {
  if (!isArtistPage(pathname)) {
    return null;
  }
  
  // Remove leading slash and return the artist path
  return pathname.replace(/^\//, '');
}
