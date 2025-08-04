import type { SearchCacheEntry } from '../../../types/search-cache';

/**
 * Creates mock cache entry for testing
 */
export const createMockCacheEntry = (overrides: Partial<SearchCacheEntry> = {}): SearchCacheEntry => ({
  path: 'test/path',
  results: [],
  search: {
    query: { artist: 'test', song: null },
    searchType: 'artist',
    dataSource: 'cifraclub',
  },
  storage: {
    timestamp: Date.now(),
    version: 1,
    expiresAt: Date.now() + 300000,
  },
  ...overrides,
});
