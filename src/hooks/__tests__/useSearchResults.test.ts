/**
 * Tests for useSearchResults hook - Main Test File
 * 
 * This file has been modularized into separate test files:
 * - useSearchResults.search-behavior.test.ts - Search behavior tests
 * - useSearchResults.url-reflection.test.ts - URL reflection tests
 * - useSearchResults.critical.test.ts - Critical performance and memory leak tests
 * - useSearchResults.filter-clear.test.ts - Filter clearing UX tests
 * 
 * Please run the individual test files for specific test suites.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { useSearchResults } from '../useSearchResults';

// Mock the search cache to avoid conflicts
vi.mock('@/cache/implementations/search-cache', () => ({
  getCachedSearchResults: vi.fn().mockReturnValue(null),
  cacheSearchResults: vi.fn(),
}));

let originalFetch: typeof global.fetch | undefined;
const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  headers: { get: () => 'application/json' },
  text: async () => '[]',
});

describe('useSearchResults - Main Test File', () => {
  beforeAll(() => {
    originalFetch = global.fetch;
    global.fetch = mockFetch as typeof global.fetch;
  });
  
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    mockFetch.mockReset();
    global.fetch = mockFetch as typeof global.fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should have basic functionality working', async () => {
    // This is a placeholder test to ensure the main test file still runs
    // All comprehensive tests have been moved to separate files
    const { result } = renderHook(() => 
      useSearchResults({
        artist: '',
        song: '',
        filterArtist: '',
        filterSong: '',
        shouldFetch: false
      })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.songs).toEqual([]);
    expect(result.current.artists).toEqual([]);
  });
});
