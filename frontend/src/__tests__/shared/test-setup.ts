/**
 * Shared test setup utilities for cache and storage tests
 * Uses test data modeled after real songs from shared/fixtures/chord-sheet/ to ensure tests work with realistic data
 */
import { vi } from 'vitest';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/constants/guitar-tunings';
import { generateCacheKey as generateChordSheetCacheKey } from '@/cache/core/cache-key-generator';

// Mock localStorage with proper implementation
export const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    length: 0,
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

/**
 * Test songs based on the actual sample songs in shared/fixtures/chord-sheet/
 * These mirror the real songs to ensure tests work with actual data
 */
export const TEST_SONGS: ChordSheet[] = [
  {
    title: "Wonderwall",
    artist: "Oasis",
    songChords: "[Intro]\nEm7  G  Dsus4  A7sus4\nEm7  G  Dsus4  A7sus4\n\n[Verse 1]\nEm7             G\nToday is gonna be the day\n              Dsus4                  A7sus4\nThat they're gonna throw it back to you\nEm7               G\nBy now you should've somehow\n              Dsus4            A7sus4\nRealized what you gotta do",
    songKey: "G",
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 0
  },
  {
    title: "Hotel California",
    artist: "Eagles",
    songChords: "[Intro]\nBm  F#  A  E  G  D  Em  F#\n\n[Verse 1]\nBm                        F#\nOn a dark desert highway, cool wind in my hair\nA                               E\nWarm smell of colitas, rising up through the air",
    songKey: "Bm",
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 0
  },
  {
    title: "Creep",
    artist: "Radiohead",
    songChords: "[Intro]\nG  B  C  Cm\nG  B  C  Cm\n\n[Verse 1]\nG                    B\nWhen you were here before\nC                    Cm\nCouldn't look you in the eye",
    songKey: "G",
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 0
  }
];

/**
 * Get a test song by index
 */
export function getTestSong(index: number): ChordSheet {
  if (index < 0 || index >= TEST_SONGS.length) {
    throw new Error(`Invalid test song index: ${index}. Available indices: 0-${TEST_SONGS.length - 1}`);
  }
  return TEST_SONGS[index];
}

/**
 * Get a random test song
 */
export function getRandomTestSong(): ChordSheet {
  return TEST_SONGS[Math.floor(Math.random() * TEST_SONGS.length)];
}

/**
 * Generate a cache key for testing
 */
export function generateCacheKey(artist: string, title: string): string {
  return generateChordSheetCacheKey(artist, title);
}

/**
 * Setup localStorage mock for tests
 */
export function setupLocalStorageMock() {
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
  return mockLocalStorage;
}

/**
 * Create a test ChordSheet with minimal required fields
 * Use this for tests that need custom data
 */
export function createTestChordSheet(overrides: Partial<ChordSheet> = {}): ChordSheet {
  return {
    title: 'Test Song',
    artist: 'Test Artist',
    songChords: '[C] Test chord content',
    songKey: 'C',
    guitarTuning: GUITAR_TUNINGS.STANDARD,
    guitarCapo: 0,
    ...overrides,
  };
}

/**
 * Pre-defined sample ChordSheets for consistent testing
 */
export const SAMPLE_CHORD_SHEETS = {
  wonderwall: async () => Promise.resolve(getTestSong(0)),
  hotelCalifornia: async () => Promise.resolve(getTestSong(1)),
  creep: async () => Promise.resolve(getTestSong(2)),
} as const;
