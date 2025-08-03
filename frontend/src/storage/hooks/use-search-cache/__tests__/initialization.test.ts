import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
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

describe('useSearchCache - Initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockConsole();
  });

  const mockCacheEntry = createMockCacheEntry();

  describe('default initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useSearchCache());

      expect(result.current.cacheEntry).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.getFromCache).toBe('function');
      expect(typeof result.current.storeInCache).toBe('function');
      expect(typeof result.current.deleteFromCache).toBe('function');
      expect(typeof result.current.clearAllCache).toBe('function');
      expect(typeof result.current.getAllFromCache).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.clearCacheEntry).toBe('function');
    });

    it('should not auto-load when path is not provided', () => {
      const mockGetService = vi.mocked(searchCacheService.get);

      renderHook(() => useSearchCache());

      expect(mockGetService).not.toHaveBeenCalled();
    });
  });

  describe('auto-loading behavior', () => {
    it('should auto-load cache when path is provided', async () => {
      const mockGetService = vi.mocked(searchCacheService.get);
      mockGetService.mockResolvedValue(mockCacheEntry);

      const params: UseSearchCacheParams = {
        path: 'artists/search',
        query: { artist: 'Beatles', song: null },
        searchType: 'artist',
        dataSource: 'cifraclub',
      };

      const { result } = renderHook(() => useSearchCache(params));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGetService).toHaveBeenCalledWith('artists/search');
      expect(result.current.cacheEntry).toEqual(mockCacheEntry);
      expect(result.current.error).toBeNull();
    });

    it('should not auto-load when validateTTL is false', () => {
      const mockGetService = vi.mocked(searchCacheService.get);

      const params: UseSearchCacheParams = {
        path: 'artists/search',
        validateTTL: false,
      };

      renderHook(() => useSearchCache(params));

      expect(mockGetService).not.toHaveBeenCalled();
    });

    it('should handle auto-load errors gracefully', async () => {
      const mockGetService = vi.mocked(searchCacheService.get);
      const error = new Error('Auto-load failed');
      mockGetService.mockRejectedValue(error);

      const params: UseSearchCacheParams = {
        path: 'artists/search',
      };

      const { result } = renderHook(() => useSearchCache(params));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Auto-load failed');
      expect(result.current.cacheEntry).toBeNull();
    });
  });

  describe('parameter validation', () => {
    it('should handle empty parameters object', () => {
      const { result } = renderHook(() => useSearchCache({}));

      expect(result.current.cacheEntry).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle undefined parameters', () => {
      const { result } = renderHook(() => useSearchCache());

      expect(result.current.cacheEntry).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
