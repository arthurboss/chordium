import { URL } from 'url';
import SEARCH_TYPES from '../constants/searchTypes.js';

/**
 * Validates if a result URL is valid for the given search type
 * @param {Object} result - The result object with url property
 * @param {string} searchType - The type of search (ARTIST, SONG, etc.)
 * @returns {boolean} - Whether the result is valid
 */
export function isValidResult(result, searchType) {
  try {
    const url = new URL(result.url);
    const path = url.pathname.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes
    
    // Filter out URLs ending with .html
    if (path.endsWith('.html')) {
      return false;
    }
    
    const segments = path.split('/').filter(Boolean);

    switch (searchType) {
      case SEARCH_TYPES.ARTIST:
        return segments.length === 1;
      case SEARCH_TYPES.SONG:
        return segments.length === 2;
      default:
        return false;
    }
  } catch (e) {
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
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
    return path.split('/')[0];
  } catch (e) {
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
    const urlObj = new URL(url);
    const path = urlObj.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
    return path;
  } catch (e) {
    return null;
  }
}
