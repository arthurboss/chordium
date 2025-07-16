import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useChordSheet } from './useChordSheet';
import { ChordSheetLoadingStrategy } from '../utils/chord-sheet-loading-strategy';
import { validateURL } from '../utils/url-validator';

// Mock all dependencies first - with factory functions to avoid hoisting issues
vi.mock('../utils/chord-sheet-loading-strategy');
vi.mock('./useChordSheet/cache-coordinator');
vi.mock('./useChordSheet/data-handlers');
vi.mock('./useChordSheet/url-determination-strategy');
vi.mock('../utils/navigation-utils');
vi.mock('../utils/fetch-error-handler');
vi.mock('../utils/route-context-detector', () => ({
  isMyChordSheetsRoute: vi.fn(() => true)
}));
vi.mock('../utils/url-validator', () => ({
  validateURL: vi.fn()
}));

const mockUseParams = vi.fn();
const mockUseNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useParams: () => mockUseParams(),
  useNavigate: () => mockUseNavigate(),
}));

const mockStrategy = {
  shouldLoadLocal: vi.fn(),
  loadLocal: vi.fn(),
};

const mockCacheCoordinator = {
  clearExpiredCache: vi.fn(),
  getChordSheetData: vi.fn(),
};

const mockDataHandlers = {
  handleFreshData: vi.fn(),
  handleErrorState: vi.fn(),
  setLoadingState: vi.fn(),
};

const mockUrlStrategy = {
  determineFetchUrl: vi.fn(),
};

const mockNavigationUtils = {
  performUrlUpdate: vi.fn(),
};

const mockErrorHandler = {
  formatFetchError: vi.fn(),
};

const mockedChordSheetLoadingStrategy = vi.mocked(ChordSheetLoadingStrategy);

vi.mock('./useChordSheet/cache-coordinator', () => ({
  CacheCoordinator: vi.fn(() => mockCacheCoordinator)
}));

vi.mock('./useChordSheet/data-handlers', () => ({
  DataHandlers: vi.fn(() => mockDataHandlers)
}));

vi.mock('./useChordSheet/url-determination-strategy', () => ({
  URLDeterminationStrategy: vi.fn(() => mockUrlStrategy)
}));

vi.mock('../utils/navigation-utils', () => ({
  NavigationUtils: vi.fn(() => mockNavigationUtils)
}));

vi.mock('../utils/fetch-error-handler', () => ({
  FetchErrorHandler: vi.fn(() => mockErrorHandler)
}));

describe('useChordSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedChordSheetLoadingStrategy.mockImplementation(() => mockStrategy);
    mockUseParams.mockReturnValue({ artist: 'eagles', song: 'hotel-california' });
    mockUseNavigate.mockReturnValue(vi.fn());
    mockCacheCoordinator.getChordSheetData.mockResolvedValue(null);
    
    // Setup data handlers to simulate real behavior with proper loading state management
    mockDataHandlers.setLoadingState.mockImplementation((fetchUrl, setChordData) => {
      setChordData({
        title: '',
        artist: 'Unknown Artist',
        songChords: '',
        songKey: '',
        guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
        guitarCapo: 0,
        loading: true,
        error: null
      });
    });
    
    mockDataHandlers.handleFreshData.mockImplementation((freshData, setChordData) => {
      if (freshData && typeof setChordData === 'function') {
        setChordData({
          ...freshData,
          loading: false,
          error: null
        });
      }
    });
    
    mockDataHandlers.handleErrorState.mockImplementation((errorMessage, fetchUrl, initialState, setChordData) => {
      setChordData({
        ...initialState,
        loading: false,
        error: errorMessage
      });
    });
    
    // Setup URL strategy mock
    mockUrlStrategy.determineFetchUrl.mockResolvedValue({
      fetchUrl: 'https://example.com/test-song',
      storageKey: 'eagles-hotel-california',
      isReconstructed: false
    });
    
    // Setup validation mock
    vi.mocked(validateURL).mockImplementation(() => {}); // No error means valid
  });

  it.skip('should load from local storage when in My Chord Sheets context', async () => {
    // Arrange - Use the actual fixture data with UI state as expected by the hook
    const mockLocalData = {
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: '[Intro]\nBm  F#  A  E  G  D  Em  F#\n\n[Verse 1]\nBm                        F#\nTest verse line one here\nA                               E\nTest verse line two goes here\nG                         D\nTest verse line three now\nEm                                         F#\nTest verse line four here\n\n[Verse 2]\nBm                            F#\nTest verse two line one here\nA                                           E\nTest verse two line two goes here\nG                              D\nTest verse two line three now\nEm                                       F#\nTest verse two line four here\n\n[Chorus]\nG                         D\nTest chorus line one here\n      F#                         Bm\nTest chorus line two goes here\n              G                   D\nTest chorus line three now here\nG                               D\nTest chorus line four goes here\n    Em                          F#\nTest chorus line five here now\n              Bm      F#  A  E  G  D  Em  F#\nTest final line here',
      songKey: 'Bm',
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
      guitarCapo: 0,
      loading: false,
      error: null
    };

    mockStrategy.shouldLoadLocal.mockReturnValue(true);
    mockStrategy.loadLocal.mockResolvedValue(mockLocalData);

    // Act
    const { result } = renderHook(() => useChordSheet());

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 5000 });

    expect(result.current.title).toBe('Hotel California');
    expect(result.current.artist).toBe('Eagles');
    expect(result.current.songChords).toBe('[Intro]\nBm  F#  A  E  G  D  Em  F#\n\n[Verse 1]\nBm                        F#\nTest verse line one here\nA                               E\nTest verse line two goes here\nG                         D\nTest verse line three now\nEm                                         F#\nTest verse line four here\n\n[Verse 2]\nBm                            F#\nTest verse two line one here\nA                                           E\nTest verse two line two goes here\nG                              D\nTest verse two line three now\nEm                                       F#\nTest verse two line four here\n\n[Chorus]\nG                         D\nTest chorus line one here\n      F#                         Bm\nTest chorus line two goes here\n              G                   D\nTest chorus line three now here\nG                               D\nTest chorus line four goes here\n    Em                          F#\nTest chorus line five here now\n              Bm      F#  A  E  G  D  Em  F#\nTest final line here');
    expect(result.current.songKey).toBe('Bm');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockStrategy.shouldLoadLocal).toHaveBeenCalledWith('eagles', 'hotel-california');
    expect(mockStrategy.loadLocal).toHaveBeenCalledWith('eagles', 'hotel-california');
  }, 10000);

  it.skip('should fall back to remote fetch when local not available', async () => {
    // Arrange
    mockStrategy.shouldLoadLocal.mockReturnValue(true);
    mockStrategy.loadLocal.mockResolvedValue(null); // Not found locally

    const remoteData = {
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: 'chord content...',
      songKey: 'Am',
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
      guitarCapo: 0
    };

    mockCacheCoordinator.getChordSheetData.mockResolvedValue(remoteData);

    // Act
    const { result } = renderHook(() => useChordSheet());

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 5000 });

    // Verify the mocks were called
    expect(mockStrategy.shouldLoadLocal).toHaveBeenCalledWith('eagles', 'hotel-california');
    expect(mockStrategy.loadLocal).toHaveBeenCalledWith('eagles', 'hotel-california');
    expect(mockCacheCoordinator.getChordSheetData).toHaveBeenCalled();
    expect(mockDataHandlers.handleFreshData).toHaveBeenCalledWith(remoteData, expect.any(Function));
    
    expect(result.current.title).toBe('Hotel California');
    expect(result.current.artist).toBe('Eagles');
    expect(result.current.songChords).toBe('chord content...');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  }, 10000);

  it('should skip local loading for search context', async () => {
    // Arrange
    mockStrategy.shouldLoadLocal.mockReturnValue(false); // Search context

    const remoteData = {
      title: 'Hotel California',
      artist: 'Eagles',
      songChords: 'chord content...',
      songKey: 'Am',
      guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
      guitarCapo: 0,
      loading: false,
      error: null
    };

    mockCacheCoordinator.getChordSheetData.mockResolvedValue(remoteData);

    // Act
    const { result } = renderHook(() => useChordSheet());

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 5000 });

    expect(mockStrategy.loadLocal).not.toHaveBeenCalled();
    expect(mockCacheCoordinator.getChordSheetData).toHaveBeenCalled();
  }, 10000);
});
