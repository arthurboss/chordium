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

describe('useSearchCache - Error State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockConsole();
  });

  const mockCacheEntry = createMockCacheEntry();

  it('should clear error state', async () => {
    const mockGetService = vi.mocked(searchCacheService.get);
    const error = new Error('Test error');
    mockGetService.mockRejectedValue(error);

    const params: UseSearchCacheParams = {
      searchKey: 'artists/search',
      validateTTL: false,
    };

    const { result } = renderHook(() => useSearchCache(params));

    // Trigger an error
    await act(async () => {
      try {
        await result.current.getFromCache();
      } catch {
        // Ignore error
      }
    });

    expect(result.current.error).toBe('Test error');

    // Clear the error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.cacheEntry).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear error when starting new operation', async () => {
    const mockGetService = vi.mocked(searchCacheService.get);
    
    // First call fails
    const error = new Error('First error');
    mockGetService.mockRejectedValueOnce(error);
    
    // Second call succeeds
    mockGetService.mockResolvedValueOnce(mockCacheEntry);

    const params: UseSearchCacheParams = {
      searchKey: 'artists/search',
      validateTTL: false,
    };

    const { result } = renderHook(() => useSearchCache(params));

    // First operation fails
    await act(async () => {
      try {
        await result.current.getFromCache();
      } catch {
        // Ignore error
      }
    });

    expect(result.current.error).toBe('First error');

    // Second operation should clear error and succeed  
    await act(async () => {
      await result.current.getFromCache();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.cacheEntry).toEqual(mockCacheEntry);
  });

  it('should maintain error state after clearing cache entry', async () => {
    const mockGetService = vi.mocked(searchCacheService.get);
    const error = new Error('Test error');
    mockGetService.mockRejectedValue(error);

    const params: UseSearchCacheParams = {
      searchKey: 'artists/search',
      validateTTL: false,
    };

    const { result } = renderHook(() => useSearchCache(params));

    // Trigger an error
    await act(async () => {
      try {
        await result.current.getFromCache();
      } catch {
        // Ignore error
      }
    });

    expect(result.current.error).toBe('Test error');

    // Clear cache entry (should not affect error)
    act(() => {
      result.current.clearCacheEntry();
    });

    expect(result.current.error).toBe('Test error');
    expect(result.current.cacheEntry).toBeNull();
  });
});
