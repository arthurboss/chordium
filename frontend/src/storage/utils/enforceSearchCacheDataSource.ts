import type { SearchCacheEntry } from '../types/search-cache';
import { SEARCH_TYPES } from '@chordium/types';

/**
 * Utility: Enforce correct dataSource for results type using searchType
 *
 * - If searchType is 'artist', dataSource must be 'supabase' or 'cifraclub'
 * - If searchType is 'song' or 'artist-song', dataSource must be 's3' or 'cifraclub'
 */
export function enforceSearchCacheDataSource(entry: SearchCacheEntry): SearchCacheEntry {
  const { searchType, dataSource } = entry.search;
  if (searchType === SEARCH_TYPES.ARTIST) {
    if (dataSource !== 'supabase' && dataSource !== 'cifraclub') {
      throw new Error(`Invalid dataSource '${dataSource}' for searchType '${SEARCH_TYPES.ARTIST}'. Must be 'supabase' or 'cifraclub'.`);
    }
  } else if (searchType === SEARCH_TYPES.SONG || searchType === SEARCH_TYPES.ARTIST_SONG) {
    if (dataSource !== 's3' && dataSource !== 'cifraclub') {
      throw new Error(`Invalid dataSource '${dataSource}' for searchType '${searchType}'. Must be 's3' or 'cifraclub'.`);
    }
  } else {
    throw new Error(`Unknown searchType '${searchType}'`);
  }
  return entry;
}
