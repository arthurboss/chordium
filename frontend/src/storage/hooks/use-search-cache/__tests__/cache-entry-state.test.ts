import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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

describe('useSearchCache - Cache Entry State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockConsole();
  });

  const mockCacheEntry = createMockCacheEntry();

  it('should clear cache entry from state', async () => {
    const mockGetService = vi.mocked(searchCacheService.get);
    mockGetService.mockResolvedValue(mockCacheEntry);

    const params: UseSearchCacheParams = {
      searchKey: 'artists/search',
      validateTTL: false,
    };

    const { result } = renderHook(() => useSearchCache(params));

    // Load cache entry
    await act(async () => {
      await result.current.getFromCache();
    });

    expect(result.current.cacheEntry).toEqual(mockCacheEntry);

    // Clear the cache entry
    act(() => {
      result.current.clearCacheEntry();
    });

    expect(result.current.cacheEntry).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle clearing cache entry when already null', () => {
    const { result } = renderHook(() => useSearchCache());

    expect(result.current.cacheEntry).toBeNull();

    // Clear cache entry (should be no-op)
    act(() => {
      result.current.clearCacheEntry();
    });

    expect(result.current.cacheEntry).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should maintain state consistency across multiple operations', async () => {
    const mockGetService = vi.mocked(searchCacheService.get);
    const mockStoreService = vi.mocked(searchCacheService.storeResults);
    const mockDeleteService = vi.mocked(searchCacheService.delete);

    mockGetService.mockResolvedValue(mockCacheEntry);
    mockStoreService.mockResolvedValue();
    mockDeleteService.mockResolvedValue(true);

    const params: UseSearchCacheParams = {
      searchKey: 'artists/search',
      query: { artist: 'Beatles', song: null },
      searchType: 'artist',
      dataSource: 'cifraclub',
      validateTTL: false,
    };

    const { result } = renderHook(() => useSearchCache(params));

    // Initial state
    expect(result.current.cacheEntry).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    // Get operation
    await act(async () => {
      await result.current.getFromCache();
    });

    expect(result.current.cacheEntry).toEqual(mockCacheEntry);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    // Store operation
    await act(async () => {
      await result.current.storeInCache([]);
    });

    expect(result.current.cacheEntry).toEqual(mockCacheEntry); // Retrieved after store
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    // Delete operation
    await act(async () => {
      await result.current.deleteFromCache();
    });

    expect(result.current.cacheEntry).toBeNull(); // Cleared after delete
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
