import type { Artist, Song } from '../../shared/types/index.js';
import { cleanCifraClubTitle, extractTitleAndArtist } from './title-parsing.js';

/**
 * Basic search result structure from DOM extraction
 */
interface BasicSearchResult {
  title?: string;
  path: string;
  [key: string]: unknown;
}

/**
 * Transforms raw search results into artist objects
 */
export function transformToArtistResults(results: BasicSearchResult[]): Artist[] {
  return results.map(result => {
    const path = result.path;
    if (!path) {
      return null;
    }
    
    const artist: Artist = {
      displayName: (result.title || '').replace(/ - Cifra Club$/, ''),
      path: path,
      songCount: null
    };

    return artist;
  }).filter((artist): artist is Artist => artist !== null);
}

/**
 * Transforms raw search results into song objects with artist information
 */
export function transformToSongResults(results: BasicSearchResult[]): Song[] {
  return results.map(result => {
    // Clean the title by removing "- Cifra Club" suffix
    const cleanedTitle = cleanCifraClubTitle(result.title || '');
    
    // Extract title and artist from the cleaned title
    const { title, artist: titleArtist } = extractTitleAndArtist(cleanedTitle);
    
    // Use the path directly from the result
    const path = result.path;
    
    // If no artist found in title, extract from URL path (e.g., "john-lennon/imagine" -> "John Lennon")
    let artist = titleArtist;
    if (!artist && path) {
      const pathSegments = path.split('/');
      if (pathSegments.length >= 2) {
        // First segment is artist slug, convert to readable name
        artist = pathSegments[0]
          .split('-')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    
    const song: Song = {
      title,
      path,
      artist
    };

    return song;
  });
}

/**
 * Generic transformation that removes Cifra Club suffix from titles
 */
export function transformToGenericResults(results: (BasicSearchResult & { url?: string })[]): Array<BasicSearchResult & { url?: string }> {
  return results.map(result => ({
    ...result,
    title: result.title ? cleanCifraClubTitle(result.title) : result.title
  }));
}
