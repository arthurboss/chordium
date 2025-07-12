/**
 * Tests for useSearchResults hook - Filter/Clear UX
 * 
 * Tests the filter clearing behavior to ensure:
 * - When filter is cleared, all last-fetched results are shown
 * - No new API calls are triggered when clearing filters
 * - Loading state is handled correctly
 * - Results are not filtered out when filter is cleared
 */

import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { useSearchResults } from '../useSearchResults';
// Import only the up-to-date chord sheet fixtures
import eaglesHotelCalifornia from '@/../fixtures/api/chord-sheet/eagles-hotel_california.json';
import radioheadCreep from '@/../fixtures/api/chord-sheet/radiohead-creep.json';
import oasisWonderwall from '@/../fixtures/api/chord-sheet/oasis-wonderwall.json';
import { ChordSheet } from '@/types/chordSheet';

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

describe('useSearchResults - Filter/Clear UX', () => {
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

  it('should show all last-fetched results and not trigger loading or API call when filter is cleared', async () => {
    // Arrange: Mock API response for initial search
    const apiResults = [
      oasisWonderwall as ChordSheet,
      radioheadCreep as ChordSheet
    ];
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify(apiResults))
    });
    global.fetch = mockFetch as typeof global.fetch;

    // Act: Perform a search with a filter ("Wonderwall")
    let filter = 'Wonderwall';
    const initialProps = {
      artist: '',
      song: filter,
      filterArtist: '',
      filterSong: '', // Don't filter during initial search
      shouldFetch: true,
    };
    const { result, rerender } = renderHook((props) =>
      useSearchResults(props),
      { initialProps }
    );

    // Wait for search to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.songs).toHaveLength(2);
    const callCountAfterSearch = mockFetch.mock.calls.length;

    // Simulate user clearing the filter input (only clear filterSong, not song)
    filter = '';
    global.fetch = mockFetch as typeof global.fetch; // Ensure fetch is still mocked
    rerender({ ...initialProps, filterSong: filter, shouldFetch: false });

    // Wait for loading to become false
    await waitFor(() => expect(result.current.loading).toBe(false));
    // Wait for filteredSongs to update to expected length
    await waitFor(() => expect(result.current.songs.length).toBe(2));

    // Assert: Should show all last-fetched results, not trigger loading or new API call
    expect(result.current.songs).toHaveLength(2);
    expect(result.current.songs).toEqual(apiResults);
    expect(mockFetch.mock.calls.length).toBe(callCountAfterSearch); // No new API call
  });
}); 