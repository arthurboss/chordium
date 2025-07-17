import { URL } from 'url';
import SEARCH_TYPES from '../../constants/searchTypes.js';
import logger from '../logger.js';
import type { SearchType } from '../../../shared/types/search.js';
import { URL_VALIDATION_ERRORS } from './validation-errors.js';

import type { ResultWithPath } from '../../../shared/types/internal/search-result.js';

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

    let path = result.path.trim();
    // Remove everything after a ? or # (query/hash)
    path = path.split('?')[0].split('#')[0];
    // Remove leading/trailing slashes
    // Remove leading/trailing slashes (correct regex)
    // Remove leading and trailing slashes (fully correct and explicit)
    path = path.replace(/^(\/)+/, '').replace(/(\/)+$/, '');

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
    logger.debug('[isValidResult] Normalized path and segments', { path, pathSegments });

    // Reject paths ending with .html, .htm, or other file extensions
    // We only want chord sheet paths, not HTML/file pages
    const lastSegment = pathSegments[pathSegments.length - 1];
    if (lastSegment && (lastSegment.endsWith('.html') || lastSegment.endsWith('.htm') || lastSegment.includes('.'))) {
      logger.debug(`URL validation failed: ${URL_VALIDATION_ERRORS.INVALID_URL_FORMAT}`, { path, reason: 'HTML or file extension detected' });
      return false;
    }

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
        // Exclude URLs where the last segment is 'letra' (lyrics, not chord sheet)
        if (pathSegments[1].toLowerCase() === 'letra') {
          logger.debug(`Chord sheet URL validation failed: Last segment is 'letra'`, { path, pathSegments });
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
