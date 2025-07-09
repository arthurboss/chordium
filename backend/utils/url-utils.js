import { URL } from 'url';
import SEARCH_TYPES from '../constants/searchTypes.js';
import logger from './logger.js';

/**
 * URL validation error types
 */
export const URL_VALIDATION_ERRORS = {
  INVALID_RESULT: 'Invalid result object',
  MISSING_URL: 'Missing or empty URL',
  INVALID_URL_FORMAT: 'Invalid URL format',
  INVALID_SEARCH_TYPE: 'Invalid search type',
  INVALID_PATH_SEGMENTS: 'Invalid path segments for search type'
};

/**
 * Validates if a result path is valid for the given search type
 * @param {Object} result - The result object with path property
 * @param {string} searchType - The type of search (ARTIST, SONG, etc.)
 * @returns {boolean} - Whether the result is valid
 */
export function isValidResult(result, searchType) {
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
    
    // Filter out paths ending with .html
    if (path.endsWith('.html')) {
      logger.debug('URL validation failed: HTML file detected', { path: result.path });
      return false;
    }
    
    const segments = path.split('/').filter(Boolean);

    switch (searchType) {
      case SEARCH_TYPES.ARTIST:
        if (segments.length !== 1) {
          logger.debug(`URL validation failed: ${URL_VALIDATION_ERRORS.INVALID_PATH_SEGMENTS}`, { 
            path: result.path, 
            expectedSegments: 1, 
            actualSegments: segments.length 
          });
          return false;
        }
        return true;
      case SEARCH_TYPES.SONG:
        if (segments.length !== 2) {
          logger.debug(`URL validation failed: ${URL_VALIDATION_ERRORS.INVALID_PATH_SEGMENTS}`, { 
            path: result.path, 
            expectedSegments: 2, 
            actualSegments: segments.length 
          });
          return false;
        }
        return true;
      default:
        logger.debug(`URL validation failed: ${URL_VALIDATION_ERRORS.INVALID_SEARCH_TYPE}`, { searchType });
        return false;
    }
  } catch (error) {
    logger.debug(`URL validation failed: ${URL_VALIDATION_ERRORS.INVALID_URL_FORMAT}`, { 
      path: result?.path, 
      error: error.message 
    });
    return false;
  }
}

/**
 * Extracts artist slug from a CifraClub URL
 * @param {string} url - The artist URL
 * @returns {string|null} - The artist slug or null if invalid
 */
export function extractArtistSlug(url) {
  try {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      logger.debug('Extract artist slug failed: Invalid URL input', { url });
      return null;
    }

    const parsedUrl = new URL(url.trim());
    const path = parsedUrl.pathname.replace(/(^\/+|\/+$)/g, '');
    const slug = path.split('/')[0];
    
    if (!slug) {
      logger.debug('Extract artist slug failed: Empty slug', { url, path });
      return null;
    }
    
    return slug;
  } catch (error) {
    logger.debug('Extract artist slug failed: URL parsing error', { 
      url, 
      error: error.message 
    });
    return null;
  }
}

/**
 * Extracts path segments from a URL
 * @param {string} url - The URL to parse
 * @returns {string|null} - The first path segment or null if invalid
 */
export function extractPathFromUrl(url) {
  try {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      logger.debug('Extract path failed: Invalid URL input', { url });
      return null;
    }

    const urlObj = new URL(url.trim());
    const pathSegments = urlObj.pathname.replace(/(^\/+|\/+$)/g, '').split('/');
    const firstSegment = pathSegments[0];
    
    // Handle root path case - return empty string for root path
    if (!firstSegment || firstSegment === '') {
      // For root path, return empty string instead of null
      if (urlObj.pathname === '/' || urlObj.pathname === '') {
        return '';
      }
      logger.debug('Extract path failed: Empty first segment', { url, pathSegments });
      return null;
    }
    
    return firstSegment;
  } catch (error) {
    logger.debug('Extract path failed: URL parsing error', { 
      url, 
      error: error.message 
    });
    return null;
  }
}

/**
 * Extracts the full path from a CifraClub URL
 * @param {string} url - The URL to parse
 * @returns {string|null} - The full path (e.g., "oasis/wonderwall") or null if invalid
 */
export function extractFullPathFromUrl(url) {
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
      error: error.message 
    });
    return null;
  }
}

/**
 * Normalizes an artist path by removing trailing slashes
 * This ensures consistent path format across all backend operations
 * @param {string} artistPath - The artist path to normalize
 * @returns {string} - The normalized artist path without trailing slash
 */
export function normalizeArtistPath(artistPath) {
  if (!artistPath || typeof artistPath !== 'string') {
    throw new Error('Invalid artist path: must be a non-empty string');
  }
  
  return artistPath.replace(/\/$/, '');
}
