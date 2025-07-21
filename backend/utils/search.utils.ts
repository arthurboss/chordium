import { SearchType, SearchResult, SEARCH_TYPES } from "@packages/types/dist";

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
  song?: string
): SearchType | null {
  if (artist && !song) return SEARCH_TYPES.ARTIST;
  if (song && !artist) return SEARCH_TYPES.SONG;
  if (artist && song) return SEARCH_TYPES.SONG;
  return null;
}
