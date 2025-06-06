import SEARCH_TYPES from '../constants/searchTypes.js';
import { isValidResult } from './url-utils.js';
import { 
  transformToArtistResults, 
  transformToSongResults, 
  transformToGenericResults 
} from './result-transformers.js';

/**
 * Filters and transforms search results based on search type
 * @param {Array} results - Raw search results
 * @param {string} searchType - The type of search (ARTIST, SONG, etc.)
 * @returns {Array} - Filtered and transformed results
 */
export function filterResults(results, searchType) {
  const validResults = results.filter(result => isValidResult(result, searchType));
  
  switch (searchType) {
    case SEARCH_TYPES.ARTIST:
      return transformToArtistResults(validResults);
    case SEARCH_TYPES.SONG:
      return transformToSongResults(validResults);
    default:
      return transformToGenericResults(validResults);
  }
}
