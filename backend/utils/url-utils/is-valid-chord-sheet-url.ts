import { URL } from 'url';
import logger from '../logger.js';

/**
 * Validates if a URL is a valid CifraClub chord sheet URL
 * Chord sheet URLs must have exactly 2 path segments: artist/song
 */
export function isValidChordSheetUrl(url: string): boolean {
  try {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      logger.debug('Chord sheet URL validation failed: Missing or empty URL', { url });
      return false;
    }

    let urlObj: URL;
    try {
      urlObj = new URL(url.trim());
    } catch (urlError) {
      logger.debug('Chord sheet URL validation failed: Invalid URL format', { url, error: urlError });
      return false;
    }

    // Check if it's a CifraClub domain
    if (!urlObj.hostname.includes('cifraclub.com')) {
      logger.debug('Chord sheet URL validation failed: Not a CifraClub URL', { url, hostname: urlObj.hostname });
      return false;
    }

    const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);

    // Chord sheets must have exactly 2 segments: artist/song
    if (pathSegments.length !== 2) {
      logger.debug('Chord sheet URL validation failed: Invalid path segments for chord sheet', { 
        url, 
        pathSegments, 
        expected: 2, 
        actual: pathSegments.length 
      });
      return false;
    }

    logger.debug('Chord sheet URL validation passed', { url, pathSegments });
    return true;
  } catch (error) {
    logger.error('Unexpected error in chord sheet URL validation:', error);
    return false;
  }
}
