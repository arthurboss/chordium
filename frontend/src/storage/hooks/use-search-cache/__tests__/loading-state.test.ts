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

describe('useSearchCache - Loading State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockConsole();
  });

  const mockCacheEntry = createMockCacheEntry();

  it('should manage loading state during operations', async () => {
    const mockGetService = vi.mocked(searchCacheService.get);
    
    let resolveCall: (value: typeof mockCacheEntry) => void;
    const callPromise = new Promise<typeof mockCacheEntry>((resolve) => {
      resolveCall = resolve;
    });
    mockGetService.mockReturnValue(callPromise);

    const params: UseSearchCacheParams = {
      path: 'artists/search',
      validateTTL: false,
    };

    const { result } = renderHook(() => useSearchCache(params));

    expect(result.current.isLoading).toBe(false);

    // Start operation
    act(() => {
      result.current.getFromCache();
    });

    expect(result.current.isLoading).toBe(true);

    // Complete operation
    await act(async () => {
      resolveCall(mockCacheEntry);
      await callPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should reset loading state on errors', async () => {
    const mockGetService = vi.mocked(searchCacheService.get);
    const error = new Error('Test error');
    mockGetService.mockRejectedValue(error);

    const params: UseSearchCacheParams = {
      path: 'artists/search',
      validateTTL: false,
    };

    const { result } = renderHook(() => useSearchCache(params));

    await act(async () => {
      try {
        await result.current.getFromCache();
      } catch {
        // Ignore error
      }
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Test error');
  });

  it('should preserve cache entry during loading states', async () => {
    const mockGetService = vi.mocked(searchCacheService.get);
    
    // First call succeeds
    mockGetService.mockResolvedValueOnce(mockCacheEntry);
    
    // Second call is delayed
    let resolveSecondCall: (value: typeof mockCacheEntry) => void;
    const secondCallPromise = new Promise<typeof mockCacheEntry>((resolve) => {
      resolveSecondCall = resolve;
    });
    mockGetService.mockReturnValueOnce(secondCallPromise);

    const params: UseSearchCacheParams = {
      path: 'artists/search',
      validateTTL: false,
    };

    const { result } = renderHook(() => useSearchCache(params));

    // First operation succeeds
    await act(async () => {
      await result.current.getFromCache();
    });

    expect(result.current.cacheEntry).toEqual(mockCacheEntry);

    // Start second operation (should preserve cache entry during loading)
    act(() => {
      result.current.getFromCache();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.cacheEntry).toEqual(mockCacheEntry); // Should be preserved

    // Complete second operation
    await act(async () => {
      resolveSecondCall(mockCacheEntry);
      await secondCallPromise;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.cacheEntry).toEqual(mockCacheEntry);
  });
});
