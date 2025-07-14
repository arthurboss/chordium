import type { SearchType } from '../../shared/types/index.js';
import type { SearchTypes } from '../../shared/types/internal/search-types.js';

/**
 * Utility functions for search controller
 */

/**
 * Builds a search query string from artist and song.
 */
export function buildSearchQuery(artist?: string, song?: string): string {
  if (artist && song) return `${artist} ${song}`;
  return artist || song || '';
}

/**
 * Determines the search type based on provided artist and song.
 */
export function determineSearchType(
  artist?: string, 
  song?: string, 
  SEARCH_TYPES?: SearchTypes
): SearchType | null {
  if (!SEARCH_TYPES) return null;
  
  if (artist && !song) return SEARCH_TYPES.ARTIST;
  if (song && !artist) return SEARCH_TYPES.SONG;
  if (artist && song) return SEARCH_TYPES.SONG;
  return null;
}
