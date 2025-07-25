import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChordSheetLoadingStrategy } from './chord-sheet-loading-strategy';
import { findLocalSong } from './local-chord-sheet-finder';
import { buildChordSheetData } from './chord-data-builder';
import { isMyChordSheetsRoute } from './route-context-detector';

// Mock dependencies
vi.mock('./local-chord-sheet-finder');
vi.mock('./chord-data-builder');
vi.mock('./route-context-detector');

const mockedFindLocalSong = vi.mocked(findLocalSong);
const mockedBuildChordSheetData = vi.mocked(buildChordSheetData);
const mockedIsMyChordSheetsRoute = vi.mocked(isMyChordSheetsRoute);

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
      const result = strategy.shouldLoadLocal('eagles', undefined);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('loadLocal', () => {
    it('should load local song and build chord data', async () => {
      // Arrange
      const mockLocalSong = {
        title: 'Hotel California',
        artist: 'Eagles',
        path: 'chord content...',
        key: 'Am',
        tuning: 'Standard',
        capo: ''
      };
      const mockChordData = {
        content: 'chord content...',
        artist: 'Eagles',
        song: 'Hotel California',
        key: 'Am',
        tuning: 'Standard',
        capo: '',
        loading: false,
        error: null
      };

      mockedFindLocalSong.mockResolvedValue(mockLocalSong);
      mockedBuildChordSheetData.mockReturnValue(mockChordData);

      // Act
      const result = await strategy.loadLocal('eagles', 'hotel-california');

      // Assert
      expect(result).toEqual(mockChordData);
      expect(mockedFindLocalSong).toHaveBeenCalledWith('eagles', 'hotel-california');
      expect(mockedBuildChordSheetData).toHaveBeenCalledWith(mockLocalSong);
    });

    it('should return null when local song not found', async () => {
      // Arrange
      mockedFindLocalSong.mockResolvedValue(null);

      // Act
      const result = await strategy.loadLocal('unknown', 'song');

      // Assert
      expect(result).toBeNull();
      expect(mockedBuildChordSheetData).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Arrange
      mockedFindLocalSong.mockRejectedValue(new Error('Load failed'));

      // Act
      const result = await strategy.loadLocal('eagles', 'hotel-california');

      // Assert
      expect(result).toBeNull();
    });
  });
});
