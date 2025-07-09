import { URL } from 'url';
import SEARCH_TYPES from '../constants/searchTypes.js';
import logger from './logger.js';
import type { SearchType } from '../../shared/types/search.js';

/**
 * URL validation error types
 */
export const URL_VALIDATION_ERRORS = {
  INVALID_RESULT: 'Invalid result object',
  MISSING_URL: 'Missing or empty URL',
  INVALID_URL_FORMAT: 'Invalid URL format',
  INVALID_SEARCH_TYPE: 'Invalid search type',
  INVALID_PATH_SEGMENTS: 'Invalid path segments for search type'
} as const;

interface ResultWithPath {
  path: string;
  [key: string]: any;
}

/**
 * Validates if a result path is valid for the given search type
 */
export function isValidResult(result: ResultWithPath, searchType: SearchType): boolean {
  try {
    // Validate input parameters
    if (!result || typeof result !== 'object') {
      logger.debug(`URL validation failed: ${URL_VALIDATION_ERRORS.INVALID_RESULT}`);
      return false;
    }

    if (!result.path || typeof result.path !== 'string' || result.path.trim() === '') {
      logger.debug(`URL validation failed: ${URL_VALIDATION_ERRORS.MISSING_URL}`, { result });
      return false;
    }

    if (!searchType || typeof searchType !== 'string') {
      logger.debug(`URL validation failed: ${URL_VALIDATION_ERRORS.INVALID_SEARCH_TYPE}`, { searchType });
      return false;
    }

    const path = result.path.trim().replace(/(^\/+|\/+$)/g, ''); // Remove leading/trailing slashes

    // Parse URL to validate format
    try {
      // Handle relative paths by adding a dummy base URL
      const url = path.startsWith('http') ? path : `https://example.com/${path}`;
      new URL(url);
    } catch (urlError) {
      logger.debug(`URL validation failed: ${URL_VALIDATION_ERRORS.INVALID_URL_FORMAT}`, { path, error: urlError });
      return false;
    }

    const pathSegments = path.split('/').filter(segment => segment.length > 0);

    // Validate path structure based on search type
    switch (searchType) {
      case SEARCH_TYPES.ARTIST:
        // Artists should have 1 segment: ["artist-name"]
        if (pathSegments.length !== 1) {
          logger.debug(`URL validation failed: ${URL_VALIDATION_ERRORS.INVALID_PATH_SEGMENTS}`, { 
            searchType, 
            pathSegments, 
            expected: 1, 
            actual: pathSegments.length 
          });
          return false;
        }
        break;

      case SEARCH_TYPES.SONG:
        // Songs should have exactly 2 segments: ["artist-name", "song-name"]
        // 3+ segments are lyrics/tabs/etc., not chord sheets
        if (pathSegments.length !== 2) {
          logger.debug(`URL validation failed: ${URL_VALIDATION_ERRORS.INVALID_PATH_SEGMENTS}`, { 
            searchType, 
            pathSegments, 
            expected: 2, 
            actual: pathSegments.length 
          });
          return false;
        }
        break;

      default:
        logger.debug(`URL validation failed: ${URL_VALIDATION_ERRORS.INVALID_SEARCH_TYPE}`, { searchType });
        return false;
    }

    return true;
  } catch (error) {
    logger.error('Unexpected error in URL validation:', error);
    return false;
  }
}

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
    
    // Song URL should have at least 2 segments: artist/song
    if (pathSegments.length < 2) {
      logger.debug('Extract song slug failed: Insufficient path segments', { url, pathSegments });
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

/**
 * Extracts the full path from a CifraClub URL
 */
export function extractFullPathFromUrl(url: string): string | null {
  try {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      logger.debug('Extract full path failed: Invalid URL input', { url });
      return null;
    }

    const urlObj = new URL(url.trim());
    const fullPath = urlObj.pathname.replace(/(^\/+|\/+$)/g, '');
    
    // Handle root path case
    if (!fullPath || fullPath === '') {
      return '';
    }
    
    return fullPath;
  } catch (error) {
    logger.debug('Extract full path failed: URL parsing error', { 
      url, 
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
}

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
