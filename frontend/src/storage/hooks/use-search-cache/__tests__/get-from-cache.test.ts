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

describe('useSearchCache - getFromCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockConsole();
  });

  const mockCacheEntry = createMockCacheEntry();

  it('should retrieve cache entry successfully', async () => {
    const mockGetService = vi.mocked(searchCacheService.get);
    mockGetService.mockResolvedValue(mockCacheEntry);

    const params: UseSearchCacheParams = {
      path: 'artists/search',
      validateTTL: false,
    };

    const { result } = renderHook(() => useSearchCache(params));

    let returnedEntry;
    await act(async () => {
      returnedEntry = await result.current.getFromCache();
    });

    expect(mockGetService).toHaveBeenCalledWith('artists/search');
    expect(result.current.cacheEntry).toEqual(mockCacheEntry);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(returnedEntry).toEqual(mockCacheEntry);
  });

  it('should handle service errors', async () => {
    const mockGetService = vi.mocked(searchCacheService.get);
    const error = new Error('Service error');
    mockGetService.mockRejectedValue(error);

    const params: UseSearchCacheParams = {
      path: 'artists/search',
      validateTTL: false,
    };

    const { result } = renderHook(() => useSearchCache(params));

    let thrownError;
    await act(async () => {
      try {
        await result.current.getFromCache();
      } catch (e) {
        thrownError = e;
      }
    });

    expect(result.current.cacheEntry).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Service error');
    expect(thrownError).toEqual(error);
  });

  it('should return null when path is missing', async () => {
    const { result } = renderHook(() => useSearchCache());

    let returnedEntry;
    await act(async () => {
      returnedEntry = await result.current.getFromCache();
    });

    expect(returnedEntry).toBeNull();
  });

  it('should handle null response from service', async () => {
    const mockGetService = vi.mocked(searchCacheService.get);
    mockGetService.mockResolvedValue(null);

    const params: UseSearchCacheParams = {
      path: 'artists/search',
      validateTTL: false,
    };

    const { result } = renderHook(() => useSearchCache(params));

    let returnedEntry;
    await act(async () => {
      returnedEntry = await result.current.getFromCache();
    });

    expect(returnedEntry).toBeNull();
    expect(result.current.cacheEntry).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
