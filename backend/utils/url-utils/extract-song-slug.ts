import { URL } from 'url';
import logger from '../logger.js';

/**
 * Extracts the song slug from a CifraClub URL
 */
export function extractSongSlug(url: string): string | null {
  try {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      logger.debug('Extract song slug failed: Invalid URL input', { url });
      return null;
    }

    const urlObj = new URL(url.trim());
    const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
    
    // Song URL should have exactly 2 segments: artist/song
    if (pathSegments.length !== 2) {
      logger.debug('Extract song slug failed: Invalid path segments', { url, pathSegments, expected: 2, actual: pathSegments.length });
      return null;
    }
    
    return pathSegments[1];
  } catch (error) {
    logger.debug('Extract song slug failed: URL parsing error', { 
      url, 
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}
