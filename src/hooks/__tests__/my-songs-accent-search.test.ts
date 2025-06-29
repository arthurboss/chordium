/**
 * Tests for accent-insensitive search in My Songs
 * 
 * The expectation is that users should be able to search for songs
 * without worrying about accents. For example:
 * - "do lado de ca" should match "Do Lado de Cá"
 * - "cafe" should match "Café" 
 * - "jose" should match "José"
 */

import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useSearchResults } from '../useSearchResults';
import { addToMySongs, clearMySongs } from '@/cache/implementations/my-songs-cache';
import { ChordSheet } from '@/types/chordSheet';

// Mock the search cache to avoid conflicts
vi.mock('@/cache/implementations/search-cache', () => ({
  getCachedSearchResults: vi.fn().mockReturnValue(null),
  cacheSearchResults: vi.fn(),
}));

// Mock fetch to ensure we're not making API calls
const mockFetch = vi.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    headers: { get: () => 'application/json' },
    text: () => Promise.resolve(JSON.stringify([]))
  } as unknown as Response)
);

global.fetch = mockFetch;

describe('My Songs - Accent-Insensitive Search', () => {
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

  it('should find songs when searching without accents for titles with accents', async () => {
    // Arrange: Add a song with accents to My Songs
    const chordSheet: ChordSheet = {
      artist: 'Chimarruts',
      title: 'Do Lado de Cá',
      songChords: '[Intro]\nGm    F    Eb    Dm',
      songKey: 'Gm',
      guitarCapo: 0,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };
    
    addToMySongs('Chimarruts', 'Do Lado de Cá', chordSheet);

    // Act: Search for the song WITHOUT accents
    const { result } = renderHook(() => 
      useSearchResults('', 'do lado de ca', '', 'do lado de ca', true)
    );

    // Assert: Should find the song despite the accent difference
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should NOT have made any fetch calls since song exists locally
    expect(mockFetch).not.toHaveBeenCalled();

    // Should show the song from My Songs
    expect(result.current.songs).toHaveLength(1);
    expect(result.current.songs[0]).toMatchObject({
      title: 'Do Lado de Cá',
      artist: 'Chimarruts',
    });
  });

  it('should find songs when searching with accents for titles without accents', async () => {
    // Arrange: Add a song without accents to My Songs
    const chordSheet: ChordSheet = {
      artist: 'Oasis',
      title: 'Wonderwall',
      songChords: '[Verse 1]\nEm7    G    D    C',
      songKey: 'Em',
      guitarCapo: 2,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };
    
    addToMySongs('Oasis', 'Wonderwall', chordSheet);

    // Act: Search WITH accents (shouldn't affect the match)
    const { result } = renderHook(() => 
      useSearchResults('', 'wóndérwáll', '', 'wóndérwáll', true)
    );

    // Assert: Should find the song despite the accent difference
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should NOT have made any fetch calls
    expect(mockFetch).not.toHaveBeenCalled();

    // Should show the song from My Songs
    expect(result.current.songs).toHaveLength(1);
    expect(result.current.songs[0]).toMatchObject({
      title: 'Wonderwall',
      artist: 'Oasis',
    });
  });

  it('should find Portuguese songs with various accent patterns', async () => {
    // Arrange: Add Portuguese songs with various accents to My Songs
    const song1: ChordSheet = {
      artist: 'Caetano Veloso',
      title: 'Você É Linda',
      songChords: '[Verse 1]\nA    E    F#m    D',
      songKey: 'A',
      guitarCapo: 0,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };

    const song2: ChordSheet = {
      artist: 'João Gilberto',
      title: 'Garota de Ipanema',
      songChords: '[Verse 1]\nFmaj7    G7    Gm7    C7',
      songKey: 'F',
      guitarCapo: 0,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };
    
    addToMySongs('Caetano Veloso', 'Você É Linda', song1);
    addToMySongs('João Gilberto', 'Garota de Ipanema', song2);

    // Act: Search for "voce e linda" (without accents)
    const { result } = renderHook(() => 
      useSearchResults('', 'voce e linda', '', 'voce e linda', true)
    );

    // Assert: Should find the song
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.songs).toHaveLength(1);
    expect(result.current.songs[0]).toMatchObject({
      title: 'Você É Linda',
      artist: 'Caetano Veloso',
    });
  });

  it('should find Spanish songs with accents when searching without them', async () => {
    // Arrange: Add Spanish songs with accents
    const song1: ChordSheet = {
      artist: 'Manu Chao',
      title: 'Bongo Bong',
      songChords: '[Verse 1]\nAm    F    C    G',
      songKey: 'Am',
      guitarCapo: 0,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };

    const song2: ChordSheet = {
      artist: 'José González',
      title: 'Heartbeats',
      songChords: '[Verse 1]\nC    G    Am    F',
      songKey: 'C',
      guitarCapo: 0,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };
    
    addToMySongs('Manu Chao', 'Bongo Bong', song1);
    addToMySongs('José González', 'Heartbeats', song2);

    // Act: Search for "jose gonzalez" (without accent)
    const { result } = renderHook(() => 
      useSearchResults('jose gonzalez', '', 'jose gonzalez', '', true)
    );

    // Assert: Should find songs by José González
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.songs).toHaveLength(1);
    expect(result.current.songs[0]).toMatchObject({
      title: 'Heartbeats',
      artist: 'José González',
    });
  });

  it('should find French songs with various accent types', async () => {
    // Arrange: Add French songs with different accents
    const song1: ChordSheet = {
      artist: 'Céline Dion',
      title: 'Pour que tu m\'aimes encore',
      songChords: '[Verse 1]\nF    C    Dm    Bb',
      songKey: 'F',
      guitarCapo: 0,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };

    const song2: ChordSheet = {
      artist: 'François Hardy',
      title: 'Tous les garçons et les filles',
      songChords: '[Verse 1]\nG    Em    C    D',
      songKey: 'G',
      guitarCapo: 0,
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
    };
    
    addToMySongs('Céline Dion', 'Pour que tu m\'aimes encore', song1);
    addToMySongs('François Hardy', 'Tous les garçons et les filles', song2);

    // Act: Search for "celine dion" (without accents)
    const { result } = renderHook(() => 
      useSearchResults('celine dion', '', 'celine dion', '', true)
    );

    // Assert: Should find songs by Céline Dion
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.songs).toHaveLength(1);
    expect(result.current.songs[0]).toMatchObject({
      title: 'Pour que tu m\'aimes encore',
      artist: 'Céline Dion',
    });
  });

  it('should find songs with partial matches that ignore accents', async () => {
    // Arrange: Add songs with various accents
    const songs = [
      {
        artist: 'Café Tacvba',
        title: 'Eres',
        chordSheet: {
          artist: 'Café Tacvba',
          title: 'Eres',
          songChords: '[Verse 1]\nAm    F    C    G',
          songKey: 'Am',
          guitarCapo: 0,
          guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
        } as ChordSheet
      },
      {
        artist: 'Maná',
        title: 'Rayando el Sol',
        chordSheet: {
          artist: 'Maná',
          title: 'Rayando el Sol',
          songChords: '[Verse 1]\nG    D    Em    C',
          songKey: 'G',
          guitarCapo: 0,
          guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
        } as ChordSheet
      }
    ];
    
    songs.forEach(song => {
      addToMySongs(song.artist, song.title, song.chordSheet);
    });

    // Act: Search for "mana" (without accent)
    const { result } = renderHook(() => 
      useSearchResults('mana', '', 'mana', '', true)
    );

    // Assert: Should find songs by Maná
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.songs).toHaveLength(1);
    expect(result.current.songs[0]).toMatchObject({
      title: 'Rayando el Sol',
      artist: 'Maná',
    });
  });
});
