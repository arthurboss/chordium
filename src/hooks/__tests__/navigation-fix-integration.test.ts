import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChordSheet } from '@/hooks/useChordSheet';
import { Song } from '@/types/song';

// Mock dependencies
const mockGetSongs = vi.fn();
const mockMigrateSongsFromOldStorage = vi.fn();

vi.mock('@/utils/unified-song-storage', () => ({
  getSongs: mockGetSongs,
  migrateSongsFromOldStorage: mockMigrateSongsFromOldStorage
}));

const mockFindLocalSong = vi.fn();
vi.mock('@/utils/local-song-finder', () => ({
  findLocalSong: mockFindLocalSong
}));

const mockIsMySONgsRoute = vi.fn();
vi.mock('@/utils/route-context-detector', () => ({
  isMySONgsRoute: mockIsMySONgsRoute
}));

const mockUseParams = vi.fn();
const mockUseNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useParams: mockUseParams,
  useNavigate: mockUseNavigate
}));

// Mock other dependencies
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

describe('Add to My Songs - Navigation Fix Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ artist: 'oasis', song: 'wonderwall' });
    mockUseNavigate.mockReturnValue(vi.fn());
    mockIsMySONgsRoute.mockReturnValue(true);
    mockMigrateSongsFromOldStorage.mockImplementation(() => {});
  });

  const testSong: Song = {
    title: 'Wonderwall',
    artist: 'Oasis',
    path: 'chord content for wonderwall',
    key: 'Em',
    tuning: 'Standard',
    capo: '2'
  };

  it('should successfully load songs from My Songs without navigation issues', async () => {
    // Setup: Song exists in unified storage and can be found locally
    mockGetSongs.mockReturnValue([testSong]);
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
        content: 'chord content for wonderwall',
        artist: 'Oasis',
        song: 'Wonderwall',
        key: 'Em',
        tuning: 'Standard',
        capo: '2',
        loading: false,
        error: null
      })
    };

    const { ChordSheetLoadingStrategy } = await import('@/utils/chord-sheet-loading-strategy');
    vi.mocked(ChordSheetLoadingStrategy).mockImplementation(() => mockLoadingStrategy);

    // Act: Render the hook (simulating clicking on a song in My Songs)
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
    
    // Step 1: Song gets added to My Songs (this would happen via useAddToMySongs)
    mockGetSongs.mockReturnValue([testSong]);
    
    // Step 2: User clicks on the song in My Songs page
    // The route context should be detected as My Songs
    mockIsMySONgsRoute.mockReturnValue(true);
    
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
      shouldLoadLocal: vi.fn().mockReturnValue(true),
      loadLocal: vi.fn().mockResolvedValue({
        content: 'chord content for wonderwall',
        artist: 'Oasis',
        song: 'Wonderwall',
        key: 'Em',
        tuning: 'Standard',
        capo: '2',
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
    expect(mockIsMySONgsRoute).toHaveBeenCalled();
    expect(mockLoadingStrategy.shouldLoadLocal).toHaveBeenCalledWith('oasis', 'wonderwall');
    expect(mockLoadingStrategy.loadLocal).toHaveBeenCalledWith('oasis', 'wonderwall');
    
    // Verify final state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.title).toBe('Wonderwall');
  });
});
