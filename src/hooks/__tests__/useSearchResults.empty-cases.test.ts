import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterAll, beforeAll, Mock } from 'vitest';
import { useSearchResults } from '../useSearchResults';

// Mock the search cache
import * as searchCache from '@/cache/implementations/search-cache';
vi.mock('@/cache/implementations/search-cache', () => ({
  getCachedSearchResults: vi.fn(),
  cacheSearchResults: vi.fn(),
}));

let originalFetch: typeof global.fetch | undefined;


describe('useSearchResults - empty results and cache cases', () => {
  beforeAll(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: async () => '[]',
    });
  });
  beforeEach(() => {
    vi.clearAllMocks();
    // Always return null for cache to force fetch
    (searchCache.getCachedSearchResults as Mock).mockReturnValue(null);
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: async () => '[]',
    }) as typeof global.fetch;
  });
  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should handle empty API response (no results)', async () => {
    const { result } = renderHook(() =>
      useSearchResults('no-such-artist', '', 'no-such-artist', '', true)
    );
    let last;
    await waitFor(() => {
      last = { ...result.current };
      // eslint-disable-next-line no-console
      console.log('DEBUG result.current:', last);
      expect(result.current.loading).toBe(false);
    }, { timeout: 20000 });
    expect(result.current.artists.length).toBe(0);
    expect(result.current.songs.length).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('should handle empty cache hit (no results)', async () => {
    (searchCache.getCachedSearchResults as Mock).mockReturnValueOnce([]);
    const { result } = renderHook(() =>
      useSearchResults('cached-artist', '', 'cached-artist', '', true)
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.artists.length).toBe(0);
    expect(result.current.songs.length).toBe(0);
    expect(result.current.error).toBeNull();
  });
});
