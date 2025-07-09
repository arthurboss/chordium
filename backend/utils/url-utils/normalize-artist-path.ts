/**
 * Normalizes an artist path by removing trailing slashes
 * This ensures consistent path format across all backend operations
 */
export function normalizeArtistPath(artistPath: string): string {
  if (!artistPath || typeof artistPath !== 'string') {
    throw new Error('Invalid artist path: must be a non-empty string');
  }
  
  return artistPath.replace(/\/$/, '');
}
