import { describe, it, expect, beforeEach } from 'vitest';
import { 
  cacheChordSheet, 
  getCachedChordSheet,
  clearChordSheetCache 
} from '../../implementations/chord-sheet-cache';
import { ChordSheet } from '@/types/chordSheet';
import { GUITAR_TUNINGS } from '@/types/guitarTuning';
import { setupLocalStorageMock } from '@/__tests__/shared/test-setup';

describe('Basic Cache Storage Operations', () => {
  beforeEach(() => {
    setupLocalStorageMock();
    clearChordSheetCache();
  });

  describe('Storage and Retrieval', () => {
    it('should store and retrieve ChordSheet objects using artist and title', () => {
      // Arrange
      const chordSheet: ChordSheet = {
        title: 'Wonderwall',
        artist: 'Oasis',
        songChords: '[Intro] C7M G/B Am7...',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 2,
      };

      // Act
      cacheChordSheet('Oasis', 'Wonderwall', chordSheet);
      const retrieved = getCachedChordSheet('Oasis', 'Wonderwall');

      // Assert
      expect(retrieved).toEqual(chordSheet);
    });

    it('should handle case-insensitive retrieval', () => {
      // Arrange
      const chordSheet: ChordSheet = {
        title: 'Hotel California',
        artist: 'Eagles',
        songChords: '[Intro] Bm F# A E...',
        songKey: 'Bm',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      // Act - store with one case
      cacheChordSheet('Eagles', 'Hotel California', chordSheet);
      
      // Retrieve with different cases
      const retrieved1 = getCachedChordSheet('EAGLES', 'HOTEL CALIFORNIA');
      const retrieved2 = getCachedChordSheet('eagles', 'hotel california');
      const retrieved3 = getCachedChordSheet('Eagles', 'Hotel California');

      // Assert - all should return the same data
      expect(retrieved1).toEqual(chordSheet);
      expect(retrieved2).toEqual(chordSheet);
      expect(retrieved3).toEqual(chordSheet);
    });

    it('should return null for non-existent cache entries', () => {
      // Act
      const result = getCachedChordSheet('Non-Existent Artist', 'Non-Existent Song');

      // Assert
      expect(result).toBeNull();
    });

    it('should overwrite existing entries when storing with same key', () => {
      // Arrange
      const originalChordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[Original] C G Am F',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      const updatedChordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[Updated] G C D Em',
        songKey: 'G',
        guitarTuning: GUITAR_TUNINGS.DROP_D,
        guitarCapo: 2,
      };

      // Act
      cacheChordSheet('Test Artist', 'Test Song', originalChordSheet);
      cacheChordSheet('Test Artist', 'Test Song', updatedChordSheet);
      const retrieved = getCachedChordSheet('Test Artist', 'Test Song');

      // Assert
      expect(retrieved).toEqual(updatedChordSheet);
      expect(retrieved).not.toEqual(originalChordSheet);
    });

    it('should handle multiple different chord sheets', () => {
      // Arrange
      const chordSheet1: ChordSheet = {
        title: 'Song 1',
        artist: 'Artist 1',
        songChords: '[Verse] C G Am F',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      const chordSheet2: ChordSheet = {
        title: 'Song 2',
        artist: 'Artist 2',
        songChords: '[Verse] G D Em C',
        songKey: 'G',
        guitarTuning: GUITAR_TUNINGS.DROP_D,
        guitarCapo: 3,
      };

      // Act
      cacheChordSheet('Artist 1', 'Song 1', chordSheet1);
      cacheChordSheet('Artist 2', 'Song 2', chordSheet2);

      const retrieved1 = getCachedChordSheet('Artist 1', 'Song 1');
      const retrieved2 = getCachedChordSheet('Artist 2', 'Song 2');

      // Assert
      expect(retrieved1).toEqual(chordSheet1);
      expect(retrieved2).toEqual(chordSheet2);
    });
  });

  describe('Cache Clearing', () => {
    it('should clear all cached chord sheets', () => {
      // Arrange
      const chordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[Verse] C G Am F',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0,
      };

      // Cache a chord sheet
      cacheChordSheet('Test Artist', 'Test Song', chordSheet);
      expect(getCachedChordSheet('Test Artist', 'Test Song')).toEqual(chordSheet);

      // Act
      clearChordSheetCache();

      // Assert
      expect(getCachedChordSheet('Test Artist', 'Test Song')).toBeNull();
    });
  });
});
