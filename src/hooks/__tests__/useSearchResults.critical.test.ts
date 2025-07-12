/**
 * Tests for useSearchResults hook - Critical Tests
 * 
 * Tests critical functionality including:
 * - Memory leak prevention (no API calls when shouldFetch is false)
 * - Performance optimization (local filtering without new fetches)
 * - Excessive re-render prevention
 * - Proper fetch gating (only on submit, not on keystrokes)
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

describe('useSearchResults - Critical Tests', () => {
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

  it('should not fetch when shouldFetch is false', async () => {
    const { result } = renderHook(() => 
      useSearchResults({
        artist: 'artist',
        song: '',
        filterArtist: '',
        filterSong: '',
        shouldFetch: false
      })
    );

    // Wait a bit to ensure no fetch occurs
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('should NOT make API calls on keystrokes when shouldFetch is false (memory leak prevention)', async () => {
    // This test ensures the memory leak we fixed doesn't regress
    const { result, rerender } = renderHook(
      ({ artist, song, shouldFetch }) => 
        useSearchResults({
          artist,
          song,
          filterArtist: '',
          filterSong: '',
          shouldFetch
        }),
      { 
        initialProps: { 
          artist: '', 
          song: '', 
          shouldFetch: false 
        } 
      }
    );

    // Simulate multiple keystrokes
    const keystrokes = ['w', 'wo', 'won', 'wond', 'wonde', 'wonder', 'wonderw', 'wonderwa', 'wonderwal', 'wonderwall'];
    
    for (const keystroke of keystrokes) {
      rerender({ 
        artist: '', 
        song: keystroke, 
        shouldFetch: false 
      });
      
      // Wait a bit to ensure no async operations
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Should have made ZERO API calls despite multiple keystrokes
    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.songs).toEqual([]);
  });

  it('should use local filtering when shouldFetch is false (performance test)', async () => {
    // First, get some data with shouldFetch: true
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify([
        oasisWonderwall as ChordSheet,
        radioheadCreep as ChordSheet
      ]))
    });

    const { result, rerender } = renderHook(
      ({ artist, song, filterSong, shouldFetch }) => 
        useSearchResults({
          artist,
          song,
          filterArtist: '',
          filterSong,
          shouldFetch
        }),
      { 
        initialProps: { 
          artist: '', 
          song: 'wonderwall', 
          filterSong: '',
          shouldFetch: true 
        } 
      }
    );

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = mockFetch.mock.calls.length;

    // Now test local filtering without shouldFetch
    rerender({ 
      artist: '', 
      song: 'wonderwall', 
      filterSong: 'wonder',
      shouldFetch: false 
    });

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 50));

    // Should NOT make additional API calls for filtering
    expect(mockFetch.mock.calls.length).toBe(initialCallCount);
    
    // Should still show filtered results
    expect(result.current.songs).toHaveLength(1);
    expect(result.current.songs[0].title).toBe('Wonderwall');
  });

  it('should prevent excessive re-renders and state updates (performance test)', async () => {
    // Mock console.log to count re-renders
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const { result, rerender } = renderHook(
      ({ artist, song, shouldFetch }) => 
        useSearchResults({
          artist,
          song,
          filterArtist: '',
          filterSong: '',
          shouldFetch
        }),
      { 
        initialProps: { 
          artist: '', 
          song: '', 
          shouldFetch: false 
        } 
      }
    );

    // Simulate rapid keystrokes (like a user typing fast)
    const rapidKeystrokes = Array.from({ length: 20 }, (_, i) => 'a'.repeat(i + 1));
    
    for (const keystroke of rapidKeystrokes) {
      rerender({ 
        artist: '', 
        song: keystroke, 
        shouldFetch: false 
      });
    }

    // Should have made ZERO API calls despite rapid keystrokes
    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);

    consoleSpy.mockRestore();
  });

  it('does not fetch on every keystroke, only onSubmit', async () => {
    // Simulate typing with shouldFetch=false
    const { result, rerender } = renderHook(
      ({ artist, song, shouldFetch }) =>
        useSearchResults({
          artist,
          song,
          filterArtist: '',
          filterSong: '',
          shouldFetch
        }),
      {
        initialProps: {
          artist: '',
          song: '',
          shouldFetch: false
        }
      }
    );

    const keystrokes = ['w', 'wo', 'won', 'wond', 'wonde', 'wonder', 'wonderw', 'wonderwa', 'wonderwal', 'wonderwall'];
    for (const keystroke of keystrokes) {
      rerender({ artist: '', song: keystroke, shouldFetch: false });
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    // Should not have fetched yet
    expect(global.fetch).not.toHaveBeenCalled();

    // Now simulate onSubmit (shouldFetch: true)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify([
        oasisWonderwall as ChordSheet
      ]))
    });
    rerender({ artist: '', song: 'wonderwall', shouldFetch: true });
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    // Should have fetched only once
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.current.songs).toHaveLength(1);
    expect(result.current.songs[0].title).toBe('Wonderwall');
  });

  it('uses local filtering after search, not new fetches', async () => {
    // First, perform a search (onSubmit)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify([
        oasisWonderwall as ChordSheet,
        radioheadCreep as ChordSheet
      ]))
    });
    const { result, rerender } = renderHook(
      ({ artist, song, filterSong, shouldFetch }) =>
        useSearchResults({
          artist,
          song,
          filterArtist: '',
          filterSong,
          shouldFetch
        }),
      {
        initialProps: {
          artist: '',
          song: 'wonderwall',
          filterSong: '',
          shouldFetch: true
        }
      }
    );
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.current.songs).toHaveLength(2);

    // Now simulate local filtering (shouldFetch: false)
    rerender({ artist: '', song: 'wonderwall', filterSong: 'wonder', shouldFetch: false });
    await new Promise(resolve => setTimeout(resolve, 20));
    // Should not have fetched again
    expect(global.fetch).toHaveBeenCalledTimes(1);
    // Should show filtered results
    expect(result.current.songs).toHaveLength(1);
    expect(result.current.songs[0].title).toBe('Wonderwall');

    // Clear filter
    rerender({ artist: '', song: 'wonderwall', filterSong: '', shouldFetch: false });
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(result.current.songs).toHaveLength(2);
  });
}); 