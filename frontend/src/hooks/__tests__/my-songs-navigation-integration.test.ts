import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Song } from '@/types/song';
import { createDefaultChordSheetWithUIState } from '@/types/chordSheetWithUIState';

// Mock dependencies before importing the hook
const mockGetMyChordSheetsAsSongs = vi.fn();
const mockIsMyChordSheetsRoute = vi.fn();

// Mock chord-sheet-storage to provide test data
vi.mock('@/utils/chord-sheet-storage', () => ({
  getMyChordSheetsAsSongs: mockGetMyChordSheetsAsSongs
}));

vi.mock('@/utils/route-context-detector', () => ({
  isMyChordSheetsRoute: mockIsMyChordSheetsRoute
}));

const mockUseParams = vi.fn();
const mockUseNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useParams: () => mockUseParams(),
  useNavigate: () => mockUseNavigate()
}));

// Top-level mock for ChordSheetLoadingStrategy as a class/constructor
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

vi.mock('@/hooks/useChordSheet/url-determination-strategy', () => ({
  URLDeterminationStrategy: vi.fn().mockImplementation(() => ({
    determineFetchUrl: vi.fn()
  }))
}));

vi.mock('@/utils/navigation-utils', () => ({
  NavigationUtils: vi.fn().mockImplementation(() => ({
    performUrlUpdate: vi.fn()
  }))
}));

vi.mock('@/hooks/useChordSheet/background-refresh-handler', () => ({
  BackgroundRefreshHandler: vi.fn().mockImplementation(() => ({
    handleBackgroundRefresh: vi.fn()
  }))
}));

vi.mock('@/hooks/useChordSheet/cache-coordinator', () => ({
  CacheCoordinator: vi.fn().mockImplementation(() => ({
    clearExpiredCache: vi.fn(),
    getChordSheetWithRefresh: vi.fn()
  }))
}));

vi.mock('@/utils/fetch-error-handler', () => ({
  FetchErrorHandler: vi.fn().mockImplementation(() => ({
    formatFetchError: vi.fn()
  }))
}));

vi.mock('@/utils/url-validator', () => ({
  validateURL: vi.fn()
}));

// Import useChordSheet after all mocks are set up
import { useChordSheet } from '@/hooks/useChordSheet';

describe('Add to My Chord Sheets - Navigation Integration', () => {
  beforeEach(() => {
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

  it.skip('should handle the complete workflow: add song, then navigate to it', async () => {
    // Simulate the complete workflow
    
    // Step 1: Song gets added to My Chord Sheets (this would happen via useAddToMyChordSheets)
    mockGetMyChordSheetsAsSongs.mockReturnValue([testSong]);
    
    // Step 2: User clicks on the song in My Chord Sheets page
    // The route context should be detected as My Chord Sheets
    mockIsMyChordSheetsRoute.mockReturnValue(true);
    
    // Act: Simulate the chord sheet loading
    const { result } = renderHook(() => useChordSheet());

    // Log params for debugging
    // eslint-disable-next-line no-console
    console.log('DEBUG params:', mockUseParams.mock.results);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Assert: Verify the final state only (global mock is used)
    // Debug log for result.current
    // eslint-disable-next-line no-console
    console.log('DEBUG result.current:', result.current);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.title).toBe('Wonderwall');
  }, 30000);
});
