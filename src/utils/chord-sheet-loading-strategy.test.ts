import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChordSheetLoadingStrategy } from './chord-sheet-loading-strategy';
import { buildChordSheetData } from './chord-data-builder';
import { isMyChordSheetsRoute } from './route-context-detector';
import { unifiedChordSheetCache } from '@/cache/implementations/unified-chord-sheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';

// Mock dependencies
vi.mock('./chord-data-builder');
vi.mock('./route-context-detector');
vi.mock('@/cache/implementations/unified-chord-sheet', () => ({
  unifiedChordSheetCache: {
    getCachedChordSheetByPath: vi.fn()
  }
}));

const mockedBuildChordSheetData = vi.mocked(buildChordSheetData);
const mockedIsMyChordSheetsRoute = vi.mocked(isMyChordSheetsRoute);
const mockedGetCachedChordSheet = vi.mocked(unifiedChordSheetCache.getCachedChordSheetByPath);

describe('ChordSheetLoadingStrategy', () => {
  let strategy: ChordSheetLoadingStrategy;

  beforeEach(() => {
    vi.clearAllMocks();
    strategy = new ChordSheetLoadingStrategy();
  });

  describe('shouldLoadLocal', () => {
    it('should return true for My Chord Sheets route with artist and song params', () => {
      // Arrange
      mockedIsMyChordSheetsRoute.mockReturnValue(true);

      // Act
      const result = strategy.shouldLoadLocal('eagles', 'hotel-california');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for search route even with params', () => {
      // Arrange
      mockedIsMyChordSheetsRoute.mockReturnValue(false);

      // Act
      const result = strategy.shouldLoadLocal('eagles', 'hotel-california');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for My Chord Sheets route without artist param', () => {
      // Arrange
      mockedIsMyChordSheetsRoute.mockReturnValue(true);

      // Act
      const result = strategy.shouldLoadLocal(undefined, 'hotel-california');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for My Chord Sheets route without song param', () => {
      // Arrange
      mockedIsMyChordSheetsRoute.mockReturnValue(true);

      // Act
      const result = strategy.shouldLoadLocal('eagles');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('loadLocal', () => {
    it('should load local song and build chord data', async () => {
      // Arrange
      const mockChordSheet = {
        title: 'Hotel California',
        artist: 'Eagles',
        songChords: 'chord content...',
        songKey: 'Am',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };
      const mockChordData = {
        title: 'Hotel California',
        artist: 'Eagles',
        songChords: 'chord content...',
        songKey: 'Am',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
        content: 'chord content...',
        song: 'Hotel California',
        key: 'Am',
        tuning: 'Standard',
        capo: '',
        loading: false,
        error: null
      };

      mockedGetCachedChordSheet.mockResolvedValue(mockChordSheet);
      mockedBuildChordSheetData.mockReturnValue(mockChordData);

      // Act
      const result = await strategy.loadLocal('eagles', 'hotel-california');

      // Assert
      expect(result).toEqual(mockChordData);
      expect(mockedGetCachedChordSheet).toHaveBeenCalledWith('eagles/hotel-california');
      expect(mockedBuildChordSheetData).toHaveBeenCalledWith(mockChordSheet);
    });

    it('should return null when local song not found', async () => {
      // Arrange
      mockedGetCachedChordSheet.mockResolvedValue(null);

      // Act
      const result = await strategy.loadLocal('unknown', 'song');

      // Assert
      expect(result).toBeNull();
      expect(mockedGetCachedChordSheet).toHaveBeenCalledWith('unknown/song');
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      mockedGetCachedChordSheet.mockRejectedValue(new Error('Load failed'));

      // Act
      const result = await strategy.loadLocal('eagles', 'hotel-california');

      // Assert
      expect(result).toBeNull();
    });
  });
});
