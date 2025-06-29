/**
 * Tests for the "local first" behavior in useSearchResults hook
 * 
 * The expectation is that if a song exists in "My Songs" (local storage),
 * it should be shown immediately in search results without making a backend API call.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useSearchResults } from '../useSearchResults';
import { addToMySongs, clearMySongs, getFromMySongs } from '@/cache/implementations/my-songs-cache';
import { ChordSheet } from '@/types/chordSheet';

// Mock the search cache to avoid conflicts
vi.mock('@/cache/implementations/search-cache', () => ({
  getCachedSearchResults: vi.fn().mockReturnValue(null),
  cacheSearchResults: vi.fn(),
}));

// Mock fetch to track API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useSearchResults - Local First Behavior', () => {
  beforeEach(() => {
    // Clear all mocks and local storage before each test
    vi.clearAllMocks();
    clearMySongs();
    mockFetch.mockClear();
    
    // Mock localStorage with actual implementation for testing
    const storage: Record<string, string> = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => storage[key] || null),
        setItem: vi.fn((key, value) => {
          storage[key] = value;
        }),
        removeItem: vi.fn((key) => {
          delete storage[key];
        }),
        clear: vi.fn(() => {
          Object.keys(storage).forEach(key => delete storage[key]);
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    clearMySongs();
    vi.restoreAllMocks();
  });

  it('should show songs from My Songs immediately when searching for existing local songs', async () => {
    // Arrange: Add a song to My Songs first
    const testChordSheet: ChordSheet = {
      artist: 'Oasis',
      title: 'Wonderwall',
      songChords: '[Verse 1]\nEm7    G    D    C\nToday is gonna be the day',
      songKey: 'Em',
      guitarCapo: 2,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };
    
    addToMySongs('Oasis', 'Wonderwall', testChordSheet);

    // Verify the song was added to My Songs
    const storedSong = getFromMySongs('Oasis', 'Wonderwall');
    expect(storedSong).not.toBeNull();
    expect(storedSong?.title).toBe('Wonderwall');

    // Act: Search for the song that exists in My Songs
    const { result } = renderHook(() => 
      useSearchResults('', 'wonderwall', '', 'wonderwall', true)
    );

    // Assert: The hook should immediately show the local song without making an API call
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should NOT have made any fetch calls since the song exists locally
    expect(mockFetch).not.toHaveBeenCalled();

    // Should show the song from My Songs in results
    expect(result.current.songs).toHaveLength(1);
    expect(result.current.songs[0]).toMatchObject({
      title: 'Wonderwall',
      artist: 'Oasis',
    });
  });

  it('should show songs from My Songs immediately when searching by artist and song that exists locally', async () => {
    // Arrange: Add multiple songs to My Songs
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
    
    addToMySongs('Oasis', 'Wonderwall', testChordSheet1);
    addToMySongs('Oasis', 'Champagne Supernova', testChordSheet2);

    // Act: Search for a specific artist + song combination that exists locally
    const { result } = renderHook(() => 
      useSearchResults('oasis', 'wonderwall', 'oasis', 'wonderwall', true)
    );

    // Assert: Should show the local song immediately
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should NOT have made any fetch calls
    expect(mockFetch).not.toHaveBeenCalled();

    // Should show the specific song from My Songs
    expect(result.current.songs).toHaveLength(1);
    expect(result.current.songs[0]).toMatchObject({
      title: 'Wonderwall',
      artist: 'Oasis',
    });
  });

  it('should fall back to API when song does not exist in My Songs', async () => {
    // Arrange: Add a different song to My Songs
    const testChordSheet: ChordSheet = {
      artist: 'Radiohead',
      title: 'Creep',
      songChords: '[Verse 1]\nG    B    C    Cm',
      songKey: 'G',
      guitarCapo: 0,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };
    
    addToMySongs('Radiohead', 'Creep', testChordSheet);

    // Mock API response for a song not in My Songs
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

    // Act: Search for a song that does NOT exist in My Songs
    const { result } = renderHook(() => 
      useSearchResults('', 'wonderwall', '', 'wonderwall', true)
    );

    // Assert: Should make an API call since song is not in My Songs
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/cifraclub-search?artist=&song=wonderwall')
      );
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

  it('should prioritize My Songs results over API results when both are available', async () => {
    // Arrange: Add a song to My Songs with different details than what API would return
    const localChordSheet: ChordSheet = {
      artist: 'Oasis',
      title: 'Wonderwall',
      songChords: '[Local Version] Em7    G    D    C',
      songKey: 'Em',
      guitarCapo: 2,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };
    
    addToMySongs('Oasis', 'Wonderwall', localChordSheet);

    // Mock API response (this should not be called)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify([
        {
          artist: 'Oasis',
          title: 'Wonderwall',
          path: '/oasis/wonderwall/',
          url: 'https://api.example.com/oasis-wonderwall'
        }
      ]))
    });

    // Act: Search for the song that exists in My Songs
    const { result } = renderHook(() => 
      useSearchResults('oasis', 'wonderwall', 'oasis', 'wonderwall', true)
    );

    // Assert: Should show local version immediately without API call
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should NOT have made any fetch calls
    expect(mockFetch).not.toHaveBeenCalled();

    // Should show the local version (Song objects don't have songChords, but this proves it's from My Songs)
    expect(result.current.songs).toHaveLength(1);
    expect(result.current.songs[0]).toMatchObject({
      title: 'Wonderwall',
      artist: 'Oasis',
      path: '/my-songs/Oasis/Wonderwall' // Local songs have this path pattern
    });
  });

  it('should show multiple My Songs results when searching by partial title', async () => {
    // Arrange: Add multiple songs with similar titles to My Songs
    const wonderwallChordSheet: ChordSheet = {
      artist: 'Oasis',
      title: 'Wonderwall',
      songChords: '[Verse 1]\nEm7    G    D    C',
      songKey: 'Em',
      guitarCapo: 2,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };

    const wonderChordSheet: ChordSheet = {
      artist: 'Stevie Wonder',
      title: 'I Wonder',
      songChords: '[Verse 1]\nC    Am    F    G',
      songKey: 'C',
      guitarCapo: 0,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };
    
    addToMySongs('Oasis', 'Wonderwall', wonderwallChordSheet);
    addToMySongs('Stevie Wonder', 'I Wonder', wonderChordSheet);

    // Act: Search with partial title that matches both songs
    const { result } = renderHook(() => 
      useSearchResults('', 'wonder', '', 'wonder', true)
    );

    // Assert: Should show both local songs immediately
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should NOT have made any fetch calls
    expect(mockFetch).not.toHaveBeenCalled();

    // Should show both matching songs from My Songs
    expect(result.current.songs).toHaveLength(2);
    expect(result.current.songs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Wonderwall', artist: 'Oasis' }),
        expect.objectContaining({ title: 'I Wonder', artist: 'Stevie Wonder' })
      ])
    );
  });
});
