import type { SearchDataState } from '@/search/types/SearchDataState';
import type { SearchCacheEntry } from '@/storage/types/search-cache';
import type { Artist, Song, DataSource } from '@chordium/types';
import type { SearchResult } from '@/search/components/SearchResults/SearchResultsLayout/SearchResultsLayout.types';

/**
 * Create a cache entry from UI search state and raw results
 */
export function mapSearchStateToCacheEntry(
  path: string,
  state: SearchDataState,
  results: Artist[] | Song[],
  dataSource: DataSource,
  ttlMs: number | null,
): SearchCacheEntry {
  return {
    path,
    results,
    search: {
      searchType: state.searchType,
      query: state.query,
      dataSource,
    },
    storage: {
      timestamp: Date.now(),
      version: 1,
      expiresAt: ttlMs === null ? null : Date.now() + ttlMs,
    },
  };
}

/**
 * Extract a minimal UI search state from a cache entry
 */
export function mapCacheEntryToSearchState(entry: SearchCacheEntry): SearchDataState {
  return {
    searchType: entry.search.searchType,
    query: {
      artist: entry.search.query.artist,
      song: entry.search.query.song,
    },
    // UI results are discriminated; caller should transform raw results accordingly
    results: [],
  };
}


/**
 * Local UI mapping helpers (keep component lean)
 */
export function mapArtistsToSearchResults(artists: Artist[]): SearchResult[] {
  return artists.map((artist) => ({ ...artist, type: 'artist' as const }));
}

export function mapSongsToSearchResults(songs: Song[]): SearchResult[] {
  return songs.map((song) => ({ ...song, type: 'song' as const }));
}


