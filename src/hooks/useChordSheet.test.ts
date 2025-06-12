import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useChordSheet } from './useChordSheet';
import { ChordSheetLoadingStrategy } from '../utils/chord-sheet-loading-strategy';
import { getChordSheetWithRefresh } from '../cache/implementations/chord-sheet-cache';

// Mock dependencies
vi.mock('../utils/chord-sheet-loading-strategy');
vi.mock('../cache/implementations/chord-sheet-cache');

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

const mockedChordSheetLoadingStrategy = vi.mocked(ChordSheetLoadingStrategy);
const mockedGetChordSheetWithRefresh = vi.mocked(getChordSheetWithRefresh);

describe('useChordSheet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedChordSheetLoadingStrategy.mockImplementation(() => mockStrategy);
    mockUseParams.mockReturnValue({ artist: 'eagles', song: 'hotel-california' });
    mockUseNavigate.mockReturnValue(vi.fn());
  });

  it('should load from local storage when in My Songs context', async () => {
    // Arrange
    const mockLocalData = {
      content: 'local chord content',
      artist: 'Eagles',
      song: 'Hotel California',
      key: 'Am',
      tuning: 'Standard',
      capo: '',
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
    });

    expect(result.current).toEqual(mockLocalData);
    expect(mockStrategy.shouldLoadLocal).toHaveBeenCalledWith('eagles', 'hotel-california');
    expect(mockStrategy.loadLocal).toHaveBeenCalledWith('eagles', 'hotel-california');
  });

  it('should fall back to remote fetch when local not available', async () => {
    // Arrange
    const mockRemoteData = {
      content: 'remote chord content',
      artist: 'Eagles',
      song: 'Hotel California',
      key: 'Am',
      tuning: 'Standard',
      capo: '',
      loading: false,
      error: null
    };

    mockStrategy.shouldLoadLocal.mockReturnValue(true);
    mockStrategy.loadLocal.mockResolvedValue(null); // Not found locally

    mockedGetChordSheetWithRefresh.mockResolvedValue({
      immediate: mockRemoteData,
      refreshPromise: Promise.resolve(mockRemoteData)
    });

    // Act
    const { result } = renderHook(() => useChordSheet());

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current).toEqual(mockRemoteData);
    expect(mockedGetChordSheetWithRefresh).toHaveBeenCalled();
  });

  it('should skip local loading for search context', async () => {
    // Arrange
    const mockRemoteData = {
      content: 'remote chord content',
      artist: 'Eagles',
      song: 'Hotel California',
      key: 'Am',
      tuning: 'Standard',
      capo: '',
      loading: false,
      error: null
    };

    mockStrategy.shouldLoadLocal.mockReturnValue(false); // Search context

    mockedGetChordSheetWithRefresh.mockResolvedValue({
      immediate: mockRemoteData,
      refreshPromise: Promise.resolve(mockRemoteData)
    });

    // Act
    const { result } = renderHook(() => useChordSheet());

    // Assert
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockStrategy.loadLocal).not.toHaveBeenCalled();
    expect(mockedGetChordSheetWithRefresh).toHaveBeenCalled();
  });
});
