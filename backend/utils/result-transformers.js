import { extractPathFromUrl, extractFullPathFromUrl } from './url-utils.js';
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
    const { title, artist: titleArtist } = extractTitleAndArtist(cleanedTitle);
    
    // Extract full path from URL for unified format
    const path = extractFullPathFromUrl(result.url);
    
    // If no artist found in title, extract from URL path (e.g., "john-lennon/imagine" -> "John Lennon")
    let artist = titleArtist;
    if (!artist && path) {
      const pathSegments = path.split('/');
      if (pathSegments.length >= 2) {
        // First segment is artist slug, convert to readable name
        artist = pathSegments[0]
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    
    return {
      title,
      path,
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
