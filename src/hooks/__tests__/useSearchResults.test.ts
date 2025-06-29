/**
 * Tests for useSearchResults hook
 * 
 * Tests the search functionality to ensure:
 * - Search always hits the API to show all available results
 * - Search does not check local storage first (that's for chord sheet loading)
 * - API results are properly returned and cached
 * - Search works for both song-only and artist searches
 */

import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useSearchResults } from '../useSearchResults';
import { addToMyChordSheets, clearMyChordSheets } from '@/cache/implementations/my-chord-sheets-cache';
import { ChordSheet } from '@/types/chordSheet';

// Mock the search cache to avoid conflicts
vi.mock('@/cache/implementations/search-cache', () => ({
  getCachedSearchResults: vi.fn().mockReturnValue(null),
  cacheSearchResults: vi.fn(),
}));

// Mock fetch to track API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useSearchResults - Search Behavior', () => {
  beforeEach(() => {
    // Clear all mocks and local storage before each test
    vi.clearAllMocks();
    clearMyChordSheets();
    mockFetch.mockClear();
  });

  afterEach(() => {
    clearMyChordSheets();
    vi.restoreAllMocks();
  });

  it('should always make API calls when searching, even if songs exist locally', async () => {
    // Arrange: Add a song to My Chord Sheets first
    const testChordSheet: ChordSheet = {
      artist: 'Oasis',
      title: 'Wonderwall',
      songChords: '[Verse 1]\nEm7    G    D    C\nToday is gonna be the day',
      songKey: 'Em',
      guitarCapo: 2,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };
    
    addToMyChordSheets('Oasis', 'Wonderwall', testChordSheet);

    // Mock API response for search
    const apiResults = [
      {
        artist: 'Oasis',
        title: 'Wonderwall',
        path: '/oasis/wonderwall/',
        url: 'https://example.com/oasis-wonderwall'
      },
      {
        artist: 'Radiohead', 
        title: 'Wonderwall Cover',
        path: '/radiohead/wonderwall-cover/',
        url: 'https://example.com/radiohead-wonderwall'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify(apiResults))
    });

    // Act: Search for the song that exists in My Chord Sheets
    const { result } = renderHook(() => 
      useSearchResults('', 'wonderwall', '', 'wonderwall', true)
    );

    // Assert: Should make API call even though song exists locally
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have made a fetch call to search API
    expect(mockFetch).toHaveBeenCalledWith('/api/cifraclub-search?artist=&song=wonderwall');

    // Should show API results, not just local results
    expect(result.current.songs).toHaveLength(2);
    expect(result.current.songs).toEqual(apiResults);
  });

  it('should make API calls for artist searches even if songs exist locally', async () => {
    // Arrange: Add multiple songs to My Chord Sheets
    const testChordSheet1: ChordSheet = {
      artist: 'Oasis',
      title: 'Wonderwall',
      songChords: '[Verse 1]\nEm7    G    D    C',
      songKey: 'Em',
      guitarCapo: 2,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };

    const testChordSheet2: ChordSheet = {
      artist: 'Oasis',
      title: 'Champagne Supernova',
      songChords: '[Verse 1]\nA    E    F#m',
      songKey: 'A',
      guitarCapo: 0,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };
    
    addToMyChordSheets('Oasis', 'Wonderwall', testChordSheet1);
    addToMyChordSheets('Oasis', 'Champagne Supernova', testChordSheet2);

    // Mock API response for artist search
    const apiResults = [
      { name: 'Oasis', songCount: 25, path: '/oasis' },
      { name: 'Oasis Cover Band', songCount: 5, path: '/oasis-cover-band' }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify(apiResults))
    });

    // Act: Search for artist that exists locally
    const { result } = renderHook(() => 
      useSearchResults('oasis', 'wonderwall', 'oasis', 'wonderwall', true)
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
    const testChordSheet: ChordSheet = {
      artist: 'Radiohead',
      title: 'Creep',
      songChords: '[Verse 1]\nG    B    C    Cm',
      songKey: 'G',
      guitarCapo: 0,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };
    
    addToMyChordSheets('Radiohead', 'Creep', testChordSheet);

    // Mock API response
    const apiResponse = [
      {
        artist: 'Oasis',
        title: 'Wonderwall',
        path: '/oasis/wonderwall/',
        url: 'https://example.com/oasis-wonderwall'
      }
    ];
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify(apiResponse))
    });

    // Act: Search for a song
    const { result } = renderHook(() => 
      useSearchResults('', 'wonderwall', '', 'wonderwall', true)
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
    // This test verifies that search doesn't check local storage first
    // (that behavior should only happen when loading chord sheets, not searching)
    
    // Arrange: Add a song to My Chord Sheets
    const localChordSheet: ChordSheet = {
      artist: 'Oasis',
      title: 'Wonderwall',
      songChords: '[Local Version] Em7    G    D    C',
      songKey: 'Em',
      guitarCapo: 2,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };
    
    addToMyChordSheets('Oasis', 'Wonderwall', localChordSheet);

    // Mock API response
    const apiResponse = [
      {
        artist: 'Oasis',
        title: 'Wonderwall',
        path: '/oasis/wonderwall/',
        url: 'https://api.example.com/oasis-wonderwall'
      },
      {
        artist: 'Ryan Adams',
        title: 'Wonderwall (Cover)',
        path: '/ryan-adams/wonderwall-cover/',
        url: 'https://api.example.com/ryan-adams-wonderwall'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify(apiResponse))
    });

    // Act: Search for the song
    const { result } = renderHook(() => 
      useSearchResults('', 'wonderwall', '', 'wonderwall', true)
    );

    // Assert: Should make API call and show API results
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have made API call
    expect(mockFetch).toHaveBeenCalledWith('/api/cifraclub-search?artist=&song=wonderwall');

    // Should show API results (multiple results including covers), not just local
    expect(result.current.songs).toHaveLength(2);
    expect(result.current.songs).toEqual(apiResponse);
  });
});
