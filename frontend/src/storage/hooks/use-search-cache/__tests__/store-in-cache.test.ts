import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Artist } from '@chordium/types';
import type { UseSearchCacheParams } from '../params.types';
import { setupMockConsole, createMockCacheEntry } from './test-utils';

// Mock the search cache service
vi.mock('../../../services/search-cache/search-cache-service', () => ({
  searchCacheService: {
    get: vi.fn(),
    storeResults: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
    getAll: vi.fn(),
  },
}));

import { useSearchCache } from '../index';
import { searchCacheService } from '../../../services/search-cache/search-cache-service';

describe('useSearchCache - storeInCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockConsole();
  });

  const mockCacheEntry = createMockCacheEntry();
  const mockResults: Artist[] = [
    { path: 'artist/beatles', displayName: 'The Beatles', songCount: 10 },
    { path: 'artist/stones', displayName: 'The Rolling Stones', songCount: 8 },
  ];

  it('should store results successfully', async () => {
    const mockStoreService = vi.mocked(searchCacheService.storeResults);
    const mockGetService = vi.mocked(searchCacheService.get);
    mockStoreService.mockResolvedValue();
    mockGetService.mockResolvedValue(mockCacheEntry);

    const params: UseSearchCacheParams = {
      path: 'artists/search',
      query: { artist: 'Beatles', song: null },
      searchType: 'artist',
      dataSource: 'cifraclub',
      validateTTL: false,
    };

    const { result } = renderHook(() => useSearchCache(params));

    await act(async () => {
      await result.current.storeInCache(mockResults);
    });

    expect(mockStoreService).toHaveBeenCalledWith({
      path: 'artists/search',
      results: mockResults,
      search: {
        query: { artist: 'Beatles', song: null },
        searchType: 'artist',
        dataSource: 'cifraclub',
      }
    });
    expect(mockGetService).toHaveBeenCalledWith('artists/search');
    expect(result.current.cacheEntry).toEqual(mockCacheEntry);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle storage errors', async () => {
    const mockStoreService = vi.mocked(searchCacheService.storeResults);
    const error = new Error('Storage failed');
    mockStoreService.mockRejectedValue(error);

    const params: UseSearchCacheParams = {
      path: 'artists/search',
      query: { artist: 'Beatles', song: null },
      searchType: 'artist',
      dataSource: 'cifraclub',
      validateTTL: false,
    };

    const { result } = renderHook(() => useSearchCache(params));

    let thrownError;
    await act(async () => {
      try {
        await result.current.storeInCache(mockResults);
      } catch (e) {
        thrownError = e;
      }
    });

    expect(result.current.cacheEntry).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Storage failed');
    expect(thrownError).toEqual(error);
  });

  it('should skip storage when required parameters are missing', async () => {
    const { result } = renderHook(() => useSearchCache({ path: 'test' }));

    await act(async () => {
      await result.current.storeInCache(mockResults);
    });

    expect(searchCacheService.storeResults).not.toHaveBeenCalled();
  });
});
