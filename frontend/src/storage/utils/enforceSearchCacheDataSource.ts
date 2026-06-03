import type { SearchCacheEntry } from '../types/search-cache';
import { SEARCH_TYPES } from '@chordium/types';

/**
 * Utility: Enforce correct dataSource for results type using searchType
 *
 * - If searchType is 'artist', dataSource must be 'neon' or 'cifraclub'
 * - If searchType is 'song' or 'artist-song', dataSource must be 'neon' or 'cifraclub'
 */
export function enforceSearchCacheDataSource(entry: SearchCacheEntry): SearchCacheEntry {
  const { searchType, dataSource } = entry.search;
  if (searchType === SEARCH_TYPES.ARTIST) {
    if (dataSource !== 'neon' && dataSource !== 'cifraclub') {
      throw new Error(`Invalid dataSource '${dataSource}' for searchType '${SEARCH_TYPES.ARTIST}'. Must be 'neon' or 'cifraclub'.`);
    }
  } else if (searchType === SEARCH_TYPES.SONG || searchType === SEARCH_TYPES.ARTIST_SONG) {
    if (dataSource !== 'neon' && dataSource !== 'cifraclub') {
      throw new Error(`Invalid dataSource '${dataSource}' for searchType '${searchType}'. Must be 'neon' or 'cifraclub'.`);
    }
  } else {
    throw new Error(`Unknown searchType '${searchType}'`);
  }
  return entry;
}
