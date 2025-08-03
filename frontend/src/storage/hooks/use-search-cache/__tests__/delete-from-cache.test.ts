import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { UseSearchCacheParams } from '../params.types';
import { setupMockConsole } from './test-utils';

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

describe('useSearchCache - deleteFromCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockConsole();
  });

  it('should delete cache entry successfully', async () => {
    const mockDeleteService = vi.mocked(searchCacheService.delete);
    mockDeleteService.mockResolvedValue(true);

    const params: UseSearchCacheParams = {
      path: 'artists/search',
      validateTTL: false,
    };

    const { result } = renderHook(() => useSearchCache(params));

    await act(async () => {
      await result.current.deleteFromCache();
    });

    expect(mockDeleteService).toHaveBeenCalledWith('artists/search');
    expect(result.current.cacheEntry).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle deletion errors', async () => {
    const mockDeleteService = vi.mocked(searchCacheService.delete);
    const error = new Error('Delete failed');
    mockDeleteService.mockRejectedValue(error);

    const params: UseSearchCacheParams = {
      path: 'artists/search',
      validateTTL: false,
    };

    const { result } = renderHook(() => useSearchCache(params));

    let thrownError;
    await act(async () => {
      try {
        await result.current.deleteFromCache();
      } catch (e) {
        thrownError = e;
      }
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Delete failed');
    expect(thrownError).toEqual(error);
  });

  it('should skip deletion when path is missing', async () => {
    const { result } = renderHook(() => useSearchCache());

    await act(async () => {
      await result.current.deleteFromCache();
    });

    expect(searchCacheService.delete).not.toHaveBeenCalled();
  });
});
