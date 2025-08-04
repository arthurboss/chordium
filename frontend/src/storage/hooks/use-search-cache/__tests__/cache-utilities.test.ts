import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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

describe('useSearchCache - Cache Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockConsole();
  });

  const mockCacheEntry = createMockCacheEntry();

  describe('clearAllCache', () => {
    it('should clear all cache successfully', async () => {
      const mockClearService = vi.mocked(searchCacheService.clear);
      mockClearService.mockResolvedValue();

      const { result } = renderHook(() => useSearchCache());

      await act(async () => {
        await result.current.clearAllCache();
      });

      expect(mockClearService).toHaveBeenCalled();
      expect(result.current.cacheEntry).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle clear errors', async () => {
      const mockClearService = vi.mocked(searchCacheService.clear);
      const error = new Error('Clear failed');
      mockClearService.mockRejectedValue(error);

      const { result } = renderHook(() => useSearchCache());

      let thrownError;
      await act(async () => {
        try {
          await result.current.clearAllCache();
        } catch (e) {
          thrownError = e;
        }
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Clear failed');
      expect(thrownError).toEqual(error);
    });
  });

  describe('getAllFromCache', () => {
    it('should get all cache entries successfully', async () => {
      const mockEntries = [mockCacheEntry];
      const mockGetAllService = vi.mocked(searchCacheService.getAll);
      mockGetAllService.mockResolvedValue(mockEntries);

      const { result } = renderHook(() => useSearchCache());

      let returnedEntries;
      await act(async () => {
        returnedEntries = await result.current.getAllFromCache();
      });

      expect(mockGetAllService).toHaveBeenCalled();
      expect(returnedEntries).toEqual(mockEntries);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle getAll errors', async () => {
      const mockGetAllService = vi.mocked(searchCacheService.getAll);
      const error = new Error('GetAll failed');
      mockGetAllService.mockRejectedValue(error);

      const { result } = renderHook(() => useSearchCache());

      let thrownError;
      await act(async () => {
        try {
          await result.current.getAllFromCache();
        } catch (e) {
          thrownError = e;
        }
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('GetAll failed');
      expect(thrownError).toEqual(error);
    });

    it('should handle empty results', async () => {
      const mockGetAllService = vi.mocked(searchCacheService.getAll);
      mockGetAllService.mockResolvedValue([]);

      const { result } = renderHook(() => useSearchCache());

      let returnedEntries;
      await act(async () => {
        returnedEntries = await result.current.getAllFromCache();
      });

      expect(returnedEntries).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });
});
