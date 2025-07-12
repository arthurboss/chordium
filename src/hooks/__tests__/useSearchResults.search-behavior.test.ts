/**
 * Tests for useSearchResults hook - Search Behavior
 * 
 * Tests the search functionality to ensure:
 * - Search always hits the API to show all available results
 * - Search does not check local storage first (that's for chord sheet loading)
 * - API results are properly returned and cached
 * - Search works for both song-only and artist searches
 */

import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { useSearchResults } from '../useSearchResults';
import { unifiedChordSheetCache } from '@/cache/implementations/unified-chord-sheet-cache';
import { ChordSheet } from '@/types/chordSheet';
// Import only the up-to-date chord sheet fixtures
import eaglesHotelCalifornia from '@/../fixtures/api/chord-sheet/eagles-hotel_california.json';
import radioheadCreep from '@/../fixtures/api/chord-sheet/radiohead-creep.json';
import oasisWonderwall from '@/../fixtures/api/chord-sheet/oasis-wonderwall.json';

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

describe('useSearchResults - Search Behavior', () => {
  beforeAll(() => {
    originalFetch = global.fetch;
    global.fetch = mockFetch as typeof global.fetch;
  });
  
  beforeEach(() => {
    // Clear all mocks and local storage before each test
    vi.clearAllMocks();
    unifiedChordSheetCache.clearAllCache();
    mockFetch.mockReset();
    global.fetch = mockFetch as typeof global.fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should always make API calls when searching, even if songs exist locally', async () => {
    // Arrange: Add a song to My Chord Sheets first
    const testChordSheet: ChordSheet = oasisWonderwall as ChordSheet;
    unifiedChordSheetCache.cacheChordSheet(testChordSheet.artist, testChordSheet.title, testChordSheet);
    unifiedChordSheetCache.setSavedStatus(testChordSheet.artist, testChordSheet.title, true);

    // Mock API response for search
    const apiResults = [oasisWonderwall as ChordSheet, radioheadCreep as ChordSheet];
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify(apiResults))
    });

    // Act: Search for the song that exists in My Chord Sheets
    const { result } = renderHook(() => 
      useSearchResults({
        artist: '',
        song: 'wonderwall',
        filterArtist: '',
        filterSong: '', // Don't filter during search - let API return all results
        shouldFetch: true,
      })
    );

    // Assert: Should make API call even though song exists locally
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have made a fetch call to search API
    expect(mockFetch).toHaveBeenCalledWith('/api/cifraclub-search?artist=&song=wonderwall');

    // Should show API results, not just local results
    expect(result.current.songs).toHaveLength(apiResults.length);
    expect(result.current.songs).toEqual(apiResults);
  });

  it('should make API calls for artist searches even if songs exist locally', async () => {
    // Arrange: Add multiple songs to My Chord Sheets
    const testChordSheet1: ChordSheet = oasisWonderwall as ChordSheet;
    const testChordSheet2: ChordSheet = radioheadCreep as ChordSheet;
    unifiedChordSheetCache.cacheChordSheet(testChordSheet1.artist, testChordSheet1.title, testChordSheet1);
    unifiedChordSheetCache.setSavedStatus(testChordSheet1.artist, testChordSheet1.title, true);
    unifiedChordSheetCache.cacheChordSheet(testChordSheet2.artist, testChordSheet2.title, testChordSheet2);
    unifiedChordSheetCache.setSavedStatus(testChordSheet2.artist, testChordSheet2.title, true);

    // Mock API response for artist search
    const apiResults = [
      { name: 'Oasis', songCount: 25, path: '/oasis' },
      { name: 'Radiohead', songCount: 18, path: '/radiohead' }
    ];
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify(apiResults))
    });

    // Act: Search for artist that exists locally
    const { result } = renderHook(() => 
      useSearchResults({
        artist: 'oasis',
        song: 'wonderwall',
        filterArtist: '', // Don't filter during search - let API return all results
        filterSong: '',
        shouldFetch: true,
      })
    );

    // Assert: Should make API call for artist search
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have made a fetch call to artists API
    expect(mockFetch).toHaveBeenCalledWith('/api/artists?artist=oasis&song=wonderwall');

    // Should show API results
    expect(result.current.artists).toEqual(apiResults);
  });

  it('should always make API calls regardless of what exists in My Chord Sheets', async () => {
    // Arrange: Add a different song to My Chord Sheets
    const testChordSheet: ChordSheet = radioheadCreep as ChordSheet;
    unifiedChordSheetCache.cacheChordSheet(testChordSheet.artist, testChordSheet.title, testChordSheet);
    unifiedChordSheetCache.setSavedStatus(testChordSheet.artist, testChordSheet.title, true);

    // Mock API response
    const apiResponse = [oasisWonderwall as ChordSheet];
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify(apiResponse))
    });

    // Act: Search for a song
    const { result } = renderHook(() => 
      useSearchResults({
        artist: '',
        song: 'wonderwall',
        filterArtist: '',
        filterSong: '', // Don't filter during search - let API return all results
        shouldFetch: true,
      })
    );

    // Assert: Should always make an API call for search
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/cifraclub-search?artist=&song=wonderwall');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should show results from API
    expect(result.current.songs).toHaveLength(1);
    expect(result.current.songs[0]).toMatchObject({
      title: 'Wonderwall',
      artist: 'Oasis',
    });
  });

  it('should not prioritize local results over API results in search', async () => {
    // Arrange: Add a song to My Chord Sheets
    const localChordSheet: ChordSheet = oasisWonderwall as ChordSheet;
    unifiedChordSheetCache.cacheChordSheet(localChordSheet.artist, localChordSheet.title, localChordSheet);
    unifiedChordSheetCache.setSavedStatus(localChordSheet.artist, localChordSheet.title, true);

    // Mock API response
    const apiResponse = [oasisWonderwall as ChordSheet, radioheadCreep as ChordSheet];
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify(apiResponse))
    });

    // Act: Search for the song
    const { result } = renderHook(() => 
      useSearchResults({
        artist: '',
        song: 'wonderwall',
        filterArtist: '',
        filterSong: '', // Don't filter during search - let API return all results
        shouldFetch: true,
      })
    );

    // Assert: Should make API call and show API results
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have made API call
    expect(mockFetch).toHaveBeenCalledWith('/api/cifraclub-search?artist=&song=wonderwall');

    // Should show API results (multiple results including covers), not just local
    expect(result.current.songs).toHaveLength(apiResponse.length);
    expect(result.current.songs).toEqual(apiResponse);
  });
}); 