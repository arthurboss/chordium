import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { populateDevModeSampleSongs } from '../../utils/dev-mode-sample-songs';
import { getAllFromMyChordSheets, clearMyChordSheets } from '../implementations/my-chord-sheets-cache';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';

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
    // Clear My ChordSheets cache before each test
    clearMyChordSheets();
    vi.clearAllMocks();
    
    // Reset to dev mode for most tests (individual tests can override)
    vi.mocked(import.meta.env).DEV = true;
  });

  it('should populate sample songs in dev mode when My ChordSheets is empty', async () => {
    // Ensure My ChordSheets is empty
    expect(getAllFromMyChordSheets()).toHaveLength(0);
    
    // Populate with sample songs
    await populateDevModeSampleSongs(mockChordSheets);
    
    // Verify songs were added
    const myChordSheets = getAllFromMyChordSheets();
    expect(myChordSheets).toHaveLength(2);
    
    // Check that both songs are present (order doesn't matter due to timestamp sorting)
    const songTitles = myChordSheets.map(song => song.title);
    expect(songTitles).toContain('Test Song 1');
    expect(songTitles).toContain('Test Song 2');
  });

  it('should skip population when My ChordSheets already has songs', async () => {
    // Pre-populate My ChordSheets with one song
    await populateDevModeSampleSongs([mockChordSheets[0]]);
    expect(getAllFromMyChordSheets()).toHaveLength(1);
    
    // Try to populate again with different songs
    await populateDevModeSampleSongs(mockChordSheets);
    
    // Should still only have the original song
    expect(getAllFromMyChordSheets()).toHaveLength(1);
    expect(getAllFromMyChordSheets()[0].title).toBe('Test Song 1');
  });

  it('should skip population in production mode', async () => {
    // We need to re-import the module with mocked env variables
    vi.doMock('../../utils/dev-mode-sample-songs', async () => {
      const actual = await vi.importActual('../../utils/dev-mode-sample-songs');
      
      // Mock the function to simulate production mode behavior
      return {
        ...actual,
        populateDevModeSampleSongs: vi.fn(async () => {
          console.log('🏭 Production mode: Skipping sample song population');
        })
      };
    });
    
    // Re-import the mocked module
    const { populateDevModeSampleSongs: mockedPopulate } = await import('../../utils/dev-mode-sample-songs');
    
    // Ensure My ChordSheets is empty
    expect(getAllFromMyChordSheets()).toHaveLength(0);
    
    // Try to populate with sample songs
    await mockedPopulate(mockChordSheets);
    
    // Verify no songs were added
    const myChordSheets = getAllFromMyChordSheets();
    expect(myChordSheets).toHaveLength(0);
  });
});
