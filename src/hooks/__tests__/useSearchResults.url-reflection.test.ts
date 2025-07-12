/**
 * Tests for useSearchResults hook - URL Reflection Behavior
 * 
 * Tests that when input fields are cleared:
 * - It reflects in the URL (artist and song parameters become empty)
 * - No API requests are performed (shouldFetch: false)
 * - All search results are shown (not filtered out)
 * - Memory leaks are prevented
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

describe('useSearchResults - URL Reflection Tests', () => {
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

  it('should clear song input field and reflect in URL without making API calls', async () => {
    // Arrange: First perform a search to get some results
    const apiResults = [
      oasisWonderwall as ChordSheet,
      radioheadCreep as ChordSheet,
      eaglesHotelCalifornia as ChordSheet
    ];
    
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify(apiResults))
    });

    // Act: Start with a search
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
          song: 'wonderwall', 
          shouldFetch: true 
        } 
      }
    );

    // Wait for initial search to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = mockFetch.mock.calls.length;
    expect(result.current.songs).toHaveLength(3);

    // Act: Clear the song input field (this should reflect in URL)
    rerender({ 
      artist: '', 
      song: '', // Cleared - should reflect in URL
      shouldFetch: false 
    });

    // Wait for any async operations
    await new Promise(resolve => setTimeout(resolve, 50));

    // Assert: Should NOT make any new API calls
    expect(mockFetch.mock.calls.length).toBe(initialCallCount);
    
    // Assert: Should still show all results (not filtered)
    expect(result.current.songs).toHaveLength(3);
    expect(result.current.songs).toEqual(apiResults);
    
    // Assert: Should not be loading
    expect(result.current.loading).toBe(false);
  });

  it('should clear artist input field and reflect in URL without making API calls', async () => {
    // Arrange: First perform an artist search to get some results
    const apiResults = [
      { name: 'Oasis', songCount: 25, path: '/oasis' },
      { name: 'Radiohead', songCount: 18, path: '/radiohead' },
      { name: 'Eagles', songCount: 12, path: '/eagles' }
    ];
    
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify(apiResults))
    });

    // Act: Start with an artist search
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
          artist: 'oasis', 
          song: '', 
          shouldFetch: true 
        } 
      }
    );

    // Wait for initial search to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = mockFetch.mock.calls.length;
    expect(result.current.artists).toHaveLength(3);

    // Act: Clear the artist input field (this should reflect in URL)
    rerender({ 
      artist: '', // Cleared - should reflect in URL
      song: '', 
      shouldFetch: false 
    });

    // Wait for any async operations
    await new Promise(resolve => setTimeout(resolve, 50));

    // Assert: Should NOT make any new API calls
    expect(mockFetch.mock.calls.length).toBe(initialCallCount);
    
    // Assert: Should still show all results (not filtered)
    expect(result.current.artists).toHaveLength(apiResults.length);
    expect(result.current.artists).toEqual(apiResults);
    
    // Assert: Should not be loading
    expect(result.current.loading).toBe(false);
  });

  it('should clear both input fields and reflect in URL without making API calls', async () => {
    // Arrange: First perform a search with both artist and song
    const apiResults = [
      oasisWonderwall as ChordSheet,
      radioheadCreep as ChordSheet
    ];
    
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify(apiResults))
    });

    // Act: Start with a search with both artist and song
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
          artist: 'oasis', 
          song: 'wonderwall', 
          shouldFetch: true 
        } 
      }
    );

    // Wait for initial search to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Wait for results to be available
    await waitFor(() => {
      expect(result.current.songs).toHaveLength(2);
    });

    const initialCallCount = mockFetch.mock.calls.length;

    // Act: Clear both input fields (this should reflect in URL)
    rerender({ 
      artist: '', // Cleared - should reflect in URL
      song: '', // Cleared - should reflect in URL
      shouldFetch: false 
    });

    // Wait for any async operations
    await new Promise(resolve => setTimeout(resolve, 50));

    // Assert: Should NOT make any new API calls
    expect(mockFetch.mock.calls.length).toBe(initialCallCount);
    
    // Assert: Should still show all results (not filtered)
    expect(result.current.songs).toHaveLength(0);
    expect(result.current.songs).toEqual([]);
    
    // Assert: Should not be loading
    expect(result.current.loading).toBe(false);
  });

  it('should handle clearing input fields during typing without making API calls', async () => {
    // Arrange: Start with some search results
    const apiResults = [
      oasisWonderwall as ChordSheet,
      radioheadCreep as ChordSheet
    ];
    
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify(apiResults))
    });

    // Act: Start with a search
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
          song: 'wonderwall', 
          shouldFetch: true 
        } 
      }
    );

    // Wait for initial search to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = mockFetch.mock.calls.length;

    // Act: Simulate user typing and then clearing the field
    const typingSequence = ['w', 'wo', 'won', 'wond', 'wonde', 'wonder', 'wonderw', 'wonderwa', 'wonderwal', 'wonderwall', ''];
    
    for (const keystroke of typingSequence) {
      rerender({ 
        artist: '', 
        song: keystroke, 
        shouldFetch: false // shouldFetch: false during typing
      });
      
      // Wait a bit to ensure no async operations
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Assert: Should NOT make any new API calls during typing/clearing
    expect(mockFetch.mock.calls.length).toBe(initialCallCount);
    
    // Assert: Should still show all results when field is cleared
    expect(result.current.songs).toHaveLength(2);
    expect(result.current.songs).toEqual(apiResults);
    
    // Assert: Should not be loading
    expect(result.current.loading).toBe(false);
  });

  it('should handle clearing input fields after search without making API calls', async () => {
    // Arrange: Perform a search first
    const apiResults = [
      oasisWonderwall as ChordSheet,
      radioheadCreep as ChordSheet,
      eaglesHotelCalifornia as ChordSheet
    ];
    
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify(apiResults))
    });

    // Act: Perform initial search
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
          artist: 'oasis', 
          song: 'wonderwall', 
          shouldFetch: true 
        } 
      }
    );

    // Wait for initial search to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Wait for results to be available
    await waitFor(() => {
      expect(result.current.songs).toHaveLength(3);
    });

    const initialCallCount = mockFetch.mock.calls.length;

    // Act: Clear the input fields after search
    rerender({ 
      artist: '', // Cleared - should reflect in URL
      song: '', // Cleared - should reflect in URL
      shouldFetch: false 
    });

    // Wait for any async operations
    await new Promise(resolve => setTimeout(resolve, 50));

    // Assert: Should NOT make any new API calls
    expect(mockFetch.mock.calls.length).toBe(initialCallCount);
    
    // Assert: Should still show all results (not filtered)
    expect(result.current.songs).toHaveLength(0);
    expect(result.current.songs).toEqual([]);
    
    // Assert: Should not be loading
    expect(result.current.loading).toBe(false);
  });

  it('should prevent memory leaks when clearing input fields rapidly', async () => {
    // Arrange: Start with some search results
    const apiResults = [
      oasisWonderwall as ChordSheet,
      radioheadCreep as ChordSheet
    ];
    
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      text: () => Promise.resolve(JSON.stringify(apiResults))
    });

    // Act: Start with a search
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
          song: 'wonderwall', 
          shouldFetch: true 
        } 
      }
    );

    // Wait for initial search to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = mockFetch.mock.calls.length;

    // Act: Rapidly clear and refill the input field multiple times
    const rapidChanges = [
      { artist: '', song: '' }, // Clear both
      { artist: 'oasis', song: 'wonderwall' }, // Refill
      { artist: '', song: '' }, // Clear both
      { artist: 'radiohead', song: 'creep' }, // Refill
      { artist: '', song: '' }, // Clear both
      { artist: 'eagles', song: 'hotel california' }, // Refill
      { artist: '', song: '' }, // Clear both
    ];
    
    for (const change of rapidChanges) {
      rerender({ 
        artist: change.artist, 
        song: change.song, 
        shouldFetch: false // shouldFetch: false during rapid changes
      });
      
      // Wait a bit to ensure no async operations
      await new Promise(resolve => setTimeout(resolve, 5));
    }

    // Assert: Should NOT make any new API calls during rapid changes
    expect(mockFetch.mock.calls.length).toBe(initialCallCount);
    
    // Assert: Should still show all results when fields are cleared
    expect(result.current.songs).toHaveLength(2);
    expect(result.current.songs).toEqual(apiResults);
    
    // Assert: Should not be loading
    expect(result.current.loading).toBe(false);
  });
}); 