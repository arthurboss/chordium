import { URL } from 'url';
import logger from '../logger.js';

/**
 * Extracts the artist slug from a CifraClub URL
 */
export function extractArtistSlug(url: string): string | null {
  try {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      logger.debug('Extract artist slug failed: Invalid URL input', { url });
      return null;
    }

    const urlObj = new URL(url.trim());
    const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
    
    // Artist URL should have at least 1 segment
    if (pathSegments.length < 1) {
      logger.debug('Extract artist slug failed: No path segments found', { url, pathSegments });
      return null;
    }
    
    return pathSegments[0];
  } catch (error) {
    logger.debug('Extract artist slug failed: URL parsing error', { 
      url, 
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}
