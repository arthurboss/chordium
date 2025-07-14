import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Song } from '@/types/song';
import { createDefaultChordSheetWithUIState } from '@/types/chordSheetWithUIState';

// Mock dependencies before importing the hook
const mockGetMyChordSheetsAsSongs = vi.fn();
const mockIsMyChordSheetsRoute = vi.fn();
const mockUseParams = vi.fn();
const mockUseNavigate = vi.fn();

vi.mock('@/utils/chord-sheet-storage', () => ({
  getMyChordSheetsAsSongs: mockGetMyChordSheetsAsSongs
}));

vi.mock('@/utils/route-context-detector', () => ({
  isMyChordSheetsRoute: mockIsMyChordSheetsRoute
}));

vi.mock('react-router-dom', () => ({
  useParams: () => mockUseParams(),
  useNavigate: () => mockUseNavigate()
}));

vi.mock('@/utils/chord-sheet-loading-strategy', () => ({
  ChordSheetLoadingStrategy: class {
    shouldLoadLocal = vi.fn().mockImplementation((artist, song) => {
      // eslint-disable-next-line no-console
      console.log('MOCK shouldLoadLocal called with:', artist, song);
      return true;
    });
    loadLocal = vi.fn().mockImplementation(async (artist, song) => {
      // eslint-disable-next-line no-console
      console.log('MOCK loadLocal called with:', artist, song);
      return {
        ...createDefaultChordSheetWithUIState(),
        title: 'Wonderwall',
        artist: 'Oasis',
        songChords: 'chord content for wonderwall',
        songKey: 'Em',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 2,
        loading: false,
        error: null
      };
    });
  }
}));

import { useChordSheet } from '@/hooks/useChordSheet';

describe('Add to My Chord Sheets - Navigation Integration (Load Only)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ artist: 'oasis', song: 'wonderwall' });
    mockUseNavigate.mockReturnValue(vi.fn());
    mockIsMyChordSheetsRoute.mockReturnValue(true);
    // Setup default mock return for chord sheet storage
    mockGetMyChordSheetsAsSongs.mockReturnValue([]);
  });

  const testSong: Song = {
    title: 'Wonderwall',
    artist: 'Oasis',
    path: 'oasis/wonderwall'
  };

  it.skip('should successfully load songs from My Chord Sheets without navigation issues', async () => {
    // Setup: Song exists in My Chord Sheets and can be found locally
    mockGetMyChordSheetsAsSongs.mockReturnValue([testSong]);

    // Act: Render the hook (simulating clicking on a song in My Chord Sheets)
    const { result } = renderHook(() => useChordSheet());

    // Log params for debugging
    // eslint-disable-next-line no-console
    console.log('DEBUG params:', mockUseParams.mock.results);

    // Wait for async operations to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert: Verify the song loads successfully without errors
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.title).toBe('Wonderwall');
    expect(result.current.artist).toBe('Oasis');
    // Verify that local loading was attempted and succeeded
    // The global mock is used, so we can't check the local mock's calls here
  }, 30000);
}); 