import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  cacheChordSheet, 
  getCachedChordSheet,
  clearChordSheetCache 
} from '../../implementations/chord-sheet-cache';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';
import { setupLocalStorageMock } from '@/__tests__/shared/test-setup';

describe('Cache Error Handling', () => {
  beforeEach(() => {
    setupLocalStorageMock();
    clearChordSheetCache();
    vi.clearAllMocks();
  });

  describe('Invalid Input Handling', () => {
    it('should handle empty artist name', () => {
      // Arrange
      console.warn = vi.fn(); // Mock console.warn
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[Verse] C G Am F',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      // Act
      cacheChordSheet('', 'Test Song', chordSheet);
      const retrieved = getCachedChordSheet('', 'Test Song');

      // Assert
      expect(retrieved).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        'Invalid artist or title provided to generateCacheKey:',
        { artist: '', title: 'Test Song' }
      );
    });

    it('should handle empty title', () => {
      // Arrange
      console.warn = vi.fn();
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[Verse] C G Am F',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      // Act
      cacheChordSheet('Test Artist', '', chordSheet);
      const retrieved = getCachedChordSheet('Test Artist', '');

      // Assert
      expect(retrieved).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        'Invalid artist or title provided to generateCacheKey:',
        { artist: 'Test Artist', title: '' }
      );
    });

    it('should handle both empty artist and title', () => {
      // Arrange
      console.warn = vi.fn();
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[Verse] C G Am F',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      // Act
      cacheChordSheet('', '', chordSheet);
      const retrieved = getCachedChordSheet('', '');

      // Assert
      expect(retrieved).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        'Invalid artist or title provided to generateCacheKey:',
        { artist: '', title: '' }
      );
    });

    it('should handle whitespace-only artist and title', () => {
      // Arrange
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[Verse] C G Am F',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      // Act
      cacheChordSheet('   ', '   ', chordSheet);
      const retrieved = getCachedChordSheet('   ', '   ');

      // Assert - whitespace gets normalized to empty strings, creating cache key "-"
      // This is actually a valid (though unusual) cache key, so it should work
      expect(retrieved).toEqual(chordSheet);
    });

    it('should handle null/undefined inputs gracefully', () => {
      // Arrange
      console.error = vi.fn();
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[Verse] C G Am F',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      // Act & Assert - should not throw errors
      expect(() => {
        cacheChordSheet(null as unknown as string, 'Test Song', chordSheet);
      }).not.toThrow();

      expect(() => {
        cacheChordSheet('Test Artist', undefined as unknown as string, chordSheet);
      }).not.toThrow();

      expect(() => {
        getCachedChordSheet(null as unknown as string, 'Test Song');
      }).not.toThrow();

      expect(() => {
        getCachedChordSheet('Test Artist', undefined as unknown as string);
      }).not.toThrow();
    });
  });

  describe('Non-existent Data Handling', () => {
    it('should return null for completely non-existent entries', () => {
      // Act
      const result = getCachedChordSheet('Never Cached Artist', 'Never Cached Song');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for partially matching entries', () => {
      // Arrange
      const chordSheet: ChordSheet = {
        title: 'Existing Song',
        artist: 'Existing Artist',
        songChords: '[Verse] C G Am F',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      cacheChordSheet('Existing Artist', 'Existing Song', chordSheet);

      // Act & Assert - wrong artist, correct song
      expect(getCachedChordSheet('Wrong Artist', 'Existing Song')).toBeNull();
      
      // Wrong song, correct artist
      expect(getCachedChordSheet('Existing Artist', 'Wrong Song')).toBeNull();
    });

    it('should handle retrieval after cache is cleared', () => {
      // Arrange
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[Verse] C G Am F',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      cacheChordSheet('Test Artist', 'Test Song', chordSheet);
      expect(getCachedChordSheet('Test Artist', 'Test Song')).toEqual(chordSheet);

      // Act
      clearChordSheetCache();

      // Assert
      expect(getCachedChordSheet('Test Artist', 'Test Song')).toBeNull();
    });
  });

  describe('localStorage Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Arrange - Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage quota exceeded');
      });

      console.error = vi.fn();

      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[Verse] C G Am F',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      // Act & Assert - should not throw
      expect(() => {
        cacheChordSheet('Test Artist', 'Test Song', chordSheet);
      }).not.toThrow();

      // Verify error was logged
      expect(console.error).toHaveBeenCalled();

      // Restore
      localStorage.setItem = originalSetItem;
    });

    it('should handle localStorage retrieval errors gracefully', () => {
      // Arrange - Mock localStorage.getItem to throw an error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn(() => {
        throw new Error('localStorage access denied');
      });

      console.error = vi.fn();

      // Act & Assert - should not throw and return null
      const result = getCachedChordSheet('Test Artist', 'Test Song');
      expect(result).toBeNull();

      // Verify error was logged
      expect(console.error).toHaveBeenCalled();

      // Restore
      localStorage.getItem = originalGetItem;
    });
  });
});
