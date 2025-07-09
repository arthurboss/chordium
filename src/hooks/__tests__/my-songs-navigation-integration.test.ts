import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Song } from '@/types/song';

// Mock dependencies before importing the hook
const mockGetMyChordSheetsAsSongs = vi.fn();
const mockFindLocalSong = vi.fn();
const mockIsMyChordSheetsRoute = vi.fn();

// Mock chord-sheet-storage to provide test data
vi.mock('@/utils/chord-sheet-storage', () => ({
  getMyChordSheetsAsSongs: mockGetMyChordSheetsAsSongs
}));

vi.mock('@/utils/local-chord-sheet-finder', () => ({
  findLocalSong: mockFindLocalSong
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

vi.mock('@/utils/chord-sheet-loading-strategy', () => ({
  ChordSheetLoadingStrategy: vi.fn().mockImplementation(() => ({
    shouldLoadLocal: vi.fn(),
    loadLocal: vi.fn()
  }))
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

vi.mock('@/hooks/useChordSheet/data-handlers', () => ({
  DataHandlers: vi.fn().mockImplementation(() => ({
    handleErrorState: vi.fn(),
    setLoadingState: vi.fn(),
    handleImmediateData: vi.fn(),
    handleFreshData: vi.fn()
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

  it('should successfully load songs from My Chord Sheets without navigation issues', async () => {
    // Setup: Song exists in My Chord Sheets and can be found locally
    mockGetMyChordSheetsAsSongs.mockReturnValue([testSong]);
    
    mockFindLocalSong.mockResolvedValue({
      title: 'Wonderwall',
      artist: 'Oasis',
      path: 'chord content for wonderwall',
      key: 'Em',
      tuning: 'Standard',
      capo: '2'
    });

    // Mock the loading strategy to return the local data
    const mockLoadingStrategy = {
      shouldLoadLocal: vi.fn().mockReturnValue(true),
      loadLocal: vi.fn().mockResolvedValue({
        title: 'Wonderwall',
        artist: 'Oasis',
        songChords: 'chord content for wonderwall',
        songKey: 'Em',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 2,
        loading: false,
        error: null
      })
    };

    const { ChordSheetLoadingStrategy } = await import('@/utils/chord-sheet-loading-strategy');
    vi.mocked(ChordSheetLoadingStrategy).mockImplementation(() => mockLoadingStrategy);

    // Act: Render the hook (simulating clicking on a song in My Chord Sheets)
    const { result } = renderHook(() => useChordSheet());

    // Wait for async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // Assert: Verify the song loads successfully without errors
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.title).toBe('Wonderwall');
    expect(result.current.artist).toBe('Oasis');
    
    // Verify that local loading was attempted and succeeded
    expect(mockLoadingStrategy.shouldLoadLocal).toHaveBeenCalledWith('oasis', 'wonderwall');
    expect(mockLoadingStrategy.loadLocal).toHaveBeenCalledWith('oasis', 'wonderwall');
  });

  it('should handle the complete workflow: add song, then navigate to it', async () => {
    // Simulate the complete workflow
    
    // Step 1: Song gets added to My Chord Sheets (this would happen via useAddToMyChordSheets)
    mockGetMyChordSheetsAsSongs.mockReturnValue([testSong]);
    
    // Step 2: User clicks on the song in My Chord Sheets page
    // The route context should be detected as My Chord Sheets
    mockIsMyChordSheetsRoute.mockReturnValue(true);
    
    // Step 3: Local song finder should find the song
    mockFindLocalSong.mockResolvedValue({
      title: 'Wonderwall',
      artist: 'Oasis',
      path: 'chord content for wonderwall',
      key: 'Em',
      tuning: 'Standard',
      capo: '2'
    });

    // Step 4: Loading strategy should load from local
    const mockLoadingStrategy = {
      shouldLoadLocal: vi.fn().mockImplementation((artist, song) => {
        // Call the mocked route detector function to simulate real behavior
        mockIsMyChordSheetsRoute();
        return Boolean(artist) && Boolean(song) && mockIsMyChordSheetsRoute();
      }),
      loadLocal: vi.fn().mockResolvedValue({
        title: 'Wonderwall',
        artist: 'Oasis',
        songChords: 'chord content for wonderwall',
        songKey: 'Em',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 2,
        loading: false,
        error: null
      })
    };

    const { ChordSheetLoadingStrategy } = await import('@/utils/chord-sheet-loading-strategy');
    vi.mocked(ChordSheetLoadingStrategy).mockImplementation(() => mockLoadingStrategy);

    // Act: Simulate the chord sheet loading
    const { result } = renderHook(() => useChordSheet());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // Assert: Verify the entire chain worked correctly
    expect(mockIsMyChordSheetsRoute).toHaveBeenCalled();
    expect(mockLoadingStrategy.shouldLoadLocal).toHaveBeenCalledWith('oasis', 'wonderwall');
    expect(mockLoadingStrategy.loadLocal).toHaveBeenCalledWith('oasis', 'wonderwall');
    
    // Verify final state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.title).toBe('Wonderwall');
  });
});
