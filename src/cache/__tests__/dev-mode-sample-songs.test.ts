import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { populateDevModeSampleSongs } from '../../utils/dev-mode-sample-songs';
import { getAllFromMySongs, clearMySongs } from '../implementations/my-songs-cache';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    DEV: true // Default to dev mode for testing
  }
}));

// Test for dev mode sample song population
describe('Dev Mode Sample Songs', () => {
  // Create a proper localStorage mock for this test
  let mockLocalStorage: { [key: string]: string } = {};
  
  beforeAll(() => {
    // Mock localStorage with actual storage behavior
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        }),
        length: 0,
        key: vi.fn(),
      },
      writable: true,
    });
  });
  const mockChordSheets: ChordSheet[] = [
    {
      title: 'Test Song 1',
      artist: 'Test Artist 1',
      songChords: 'C G Am F',
      songKey: 'C',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 0
    },
    {
      title: 'Test Song 2',
      artist: 'Test Artist 2',
      songChords: 'G D Em C',
      songKey: 'G',
      guitarTuning: GUITAR_TUNINGS.STANDARD,
      guitarCapo: 2
    }
  ];

  beforeEach(() => {
    // Clear the mock localStorage
    mockLocalStorage = {};
    // Clear My Songs cache before each test
    clearMySongs();
    vi.clearAllMocks();
  });

  it('should populate sample songs in dev mode when My Songs is empty', async () => {
    // Ensure My Songs is empty
    expect(getAllFromMySongs()).toHaveLength(0);
    
    // Populate with sample songs
    await populateDevModeSampleSongs(mockChordSheets);
    
    // Verify songs were added
    const mySongs = getAllFromMySongs();
    expect(mySongs).toHaveLength(2);
    
    // Check that both songs are present (order doesn't matter due to timestamp sorting)
    const songTitles = mySongs.map(song => song.title);
    expect(songTitles).toContain('Test Song 1');
    expect(songTitles).toContain('Test Song 2');
  });

  it('should skip population when My Songs already has songs', async () => {
    // Pre-populate My Songs with one song
    await populateDevModeSampleSongs([mockChordSheets[0]]);
    expect(getAllFromMySongs()).toHaveLength(1);
    
    // Try to populate again with different songs
    await populateDevModeSampleSongs(mockChordSheets);
    
    // Should still only have the original song
    expect(getAllFromMySongs()).toHaveLength(1);
    expect(getAllFromMySongs()[0].title).toBe('Test Song 1');
  });

  it('should skip population in production mode', async () => {
    // Mock production environment
    vi.mocked(import.meta.env).DEV = false;
    
    // Ensure My Songs is empty
    expect(getAllFromMySongs()).toHaveLength(0);
    
    // Try to populate with sample songs
    await populateDevModeSampleSongs(mockChordSheets);
    
    // Verify no songs were added
    const mySongs = getAllFromMySongs();
    expect(mySongs).toHaveLength(0);
    
    // Reset to dev mode for other tests
    vi.mocked(import.meta.env).DEV = true;
  });
});
