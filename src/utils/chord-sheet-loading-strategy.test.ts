import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChordSheetLoadingStrategy } from './chord-sheet-loading-strategy';
import { findLocalSong } from './local-song-finder';
import { buildChordSheetData } from './chord-data-builder';
import { isMySONgsRoute } from './route-context-detector';

// Mock dependencies
vi.mock('./local-song-finder');
vi.mock('./chord-data-builder');
vi.mock('./route-context-detector');

const mockedFindLocalSong = vi.mocked(findLocalSong);
const mockedBuildChordSheetData = vi.mocked(buildChordSheetData);
const mockedIsMySONgsRoute = vi.mocked(isMySONgsRoute);

describe('ChordSheetLoadingStrategy', () => {
  let strategy: ChordSheetLoadingStrategy;

  beforeEach(() => {
    vi.clearAllMocks();
    strategy = new ChordSheetLoadingStrategy();
  });

  describe('shouldLoadLocal', () => {
    it('should return true for My Songs route with artist and song params', () => {
      // Arrange
      mockedIsMySONgsRoute.mockReturnValue(true);

      // Act
      const result = strategy.shouldLoadLocal('eagles', 'hotel-california');

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for search route even with params', () => {
      // Arrange
      mockedIsMySONgsRoute.mockReturnValue(false);

      // Act
      const result = strategy.shouldLoadLocal('eagles', 'hotel-california');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for My Songs route without artist param', () => {
      // Arrange
      mockedIsMySONgsRoute.mockReturnValue(true);

      // Act
      const result = strategy.shouldLoadLocal(undefined, 'hotel-california');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for My Songs route without song param', () => {
      // Arrange
      mockedIsMySONgsRoute.mockReturnValue(true);

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
