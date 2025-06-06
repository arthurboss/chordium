import { extractPathFromUrl } from './url-utils.js';
import { cleanCifraClubTitle, extractTitleAndArtist } from './title-parsing.js';

/**
 * Transforms raw search results into artist objects
 * @param {Array} results - Array of raw search results
 * @returns {Array} - Array of transformed artist objects
 */
export function transformToArtistResults(results) {
  return results.map(result => {
    const path = extractPathFromUrl(result.url);
    if (!path) {
      return null;
    }
    
    return {
      displayName: result.title.replace(/ - Cifra Club$/, ''),
      path: path,
      songCount: null
    };
  }).filter(Boolean);
}

/**
 * Transforms raw search results into song objects with artist information
 * @param {Array} results - Array of raw search results
 * @returns {Array} - Array of transformed song objects
 */
export function transformToSongResults(results) {
  return results.map(result => {
    // Clean the title by removing "- Cifra Club" suffix
    const cleanedTitle = cleanCifraClubTitle(result.title);
    
    // Extract title and artist from the cleaned title
    const { title, artist } = extractTitleAndArtist(cleanedTitle);
    
    return {
      title,
      url: result.url,
      artist
    };
  });
}

/**
 * Transforms raw search results into generic results (fallback)
 * @param {Array} results - Array of raw search results
 * @returns {Array} - Array of transformed generic results
 */
export function transformToGenericResults(results) {
  return results.map(result => ({
    ...result,
    title: result.title.replace(/ - Cifra Club$/, '')
  }));
}
