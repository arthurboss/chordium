import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChordSheetService } from '../chord-sheet.service';
import { ChordSheet } from '../../types/chordSheet';
import { GUITAR_TUNINGS } from '../../types/guitarTuning';
import { LegacyChordSheet } from '../../utils/chordsheet-transformer';

// Mock the cache module
vi.mock('../../cache', () => ({
  getCachedChordSheet: vi.fn(),
  cacheChordSheet: vi.fn()
}));

import { getCachedChordSheet, cacheChordSheet } from '../../cache';

const mockGetCachedChordSheet = vi.mocked(getCachedChordSheet);
const mockCacheChordSheet = vi.mocked(cacheChordSheet);

describe('ChordSheetService (TDD)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getChordSheet', () => {
    it('should return null when no chord sheet is cached', () => {
      mockGetCachedChordSheet.mockReturnValue(null);

      const result = ChordSheetService.getChordSheet('test-song');

      expect(result).toBeNull();
      expect(mockGetCachedChordSheet).toHaveBeenCalledWith('test-song');
    });

    it('should return chord sheet in new format directly', () => {
      const newFormatChordSheet: ChordSheet = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: '[C]Test[G]',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };

      mockGetCachedChordSheet.mockReturnValue(newFormatChordSheet);

      const result = ChordSheetService.getChordSheet('test-song');

      expect(result).toEqual(newFormatChordSheet);
    });

    it('should transform legacy format and update cache', () => {
      const legacyChordSheet: LegacyChordSheet = {
        title: 'Legacy Song',
        artist: 'Legacy Artist',
        chords: '[C]Legacy chords[G]',
        key: 'C',
        tuning: 'Standard',
        capo: '2'
      };

      mockGetCachedChordSheet.mockReturnValue(legacyChordSheet as unknown as ChordSheet);

      const result = ChordSheetService.getChordSheet('legacy-song');

      expect(result).toEqual({
        title: 'Legacy Song',
        artist: 'Legacy Artist',
        songChords: '[C]Legacy chords[G]',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 2
      });

      // Should update cache with transformed version
      expect(mockCacheChordSheet).toHaveBeenCalledWith('legacy-song', result);
    });
  });

  describe('saveChordSheet', () => {
    it('should save chord sheet to cache', () => {
      const chordSheet: ChordSheet = {
        title: 'Save Test',
        artist: 'Test Artist',
        songChords: '[C]Save test[G]',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };

      ChordSheetService.saveChordSheet('save-test', chordSheet);

      expect(mockCacheChordSheet).toHaveBeenCalledWith('save-test', chordSheet);
    });
  });

  describe('createChordSheet', () => {
    it('should create chord sheet with defaults', () => {
      const result = ChordSheetService.createChordSheet();

      expect(result).toEqual({
        title: '',
        artist: 'Unknown Artist',
        songChords: '',
        songKey: '',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      });
    });

    it('should allow overriding defaults', () => {
      const result = ChordSheetService.createChordSheet({
        title: 'Custom Song',
        songKey: 'Am'
      });

      expect(result).toEqual({
        title: 'Custom Song',
        artist: 'Unknown Artist',
        songChords: '',
        songKey: 'Am',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      });
    });
  });

  describe('utility methods', () => {
    const testChordSheet: ChordSheet = {
      title: 'Test Song',
      artist: 'Test Artist',
      songChords: '[Intro] C G Am F\n[Verse] C G Am F\nSome lyrics',
      songKey: 'C',
      guitarTuning: GUITAR_TUNINGS.DROP_D,
      guitarCapo: 3
    };

    describe('getChordContent', () => {
      it('should return chord content', () => {
        const result = ChordSheetService.getChordContent(testChordSheet);
        expect(result).toBe('[Intro] C G Am F\n[Verse] C G Am F\nSome lyrics');
      });

      it('should return empty string for null', () => {
        const result = ChordSheetService.getChordContent(null);
        expect(result).toBe('');
      });
    });

    describe('getTuningDisplay', () => {
      it('should return tuning string', () => {
        const result = ChordSheetService.getTuningDisplay(testChordSheet);
        expect(result).toBe('D A D G B E');
      });

      it('should return empty string for null', () => {
        const result = ChordSheetService.getTuningDisplay(null);
        expect(result).toBe('');
      });
    });

    describe('getCapoDisplay', () => {
      it('should return capo string', () => {
        const result = ChordSheetService.getCapoDisplay(testChordSheet);
        expect(result).toBe('Capo 3');
      });

      it('should return "No capo" for capo 0', () => {
        const noCapoSheet = { ...testChordSheet, guitarCapo: 0 };
        const result = ChordSheetService.getCapoDisplay(noCapoSheet);
        expect(result).toBe('No capo');
      });

      it('should return "No capo" for null', () => {
        const result = ChordSheetService.getCapoDisplay(null);
        expect(result).toBe('No capo');
      });
    });

    describe('hasContent', () => {
      it('should return true for chord sheet with content', () => {
        const result = ChordSheetService.hasContent(testChordSheet);
        expect(result).toBe(true);
      });

      it('should return false for empty chord sheet', () => {
        const emptySheet = { ...testChordSheet, songChords: '' };
        const result = ChordSheetService.hasContent(emptySheet);
        expect(result).toBe(false);
      });

      it('should return false for null', () => {
        const result = ChordSheetService.hasContent(null);
        expect(result).toBe(false);
      });
    });

    describe('getMetadata', () => {
      it('should return complete metadata', () => {
        const result = ChordSheetService.getMetadata(testChordSheet);

        expect(result).toEqual({
          title: 'Test Song',
          artist: 'Test Artist',
          key: 'C',
          tuning: 'D A D G B E',
          capo: 'Capo 3',
          hasContent: true
        });
      });

      it('should return default metadata for null', () => {
        const result = ChordSheetService.getMetadata(null);

        expect(result).toEqual({
          title: '',
          artist: 'Unknown Artist',
          key: '',
          tuning: '',
          capo: 'No capo',
          hasContent: false
        });
      });

      it('should handle empty song key', () => {
        const noKeySheet = { ...testChordSheet, songKey: '' };
        const result = ChordSheetService.getMetadata(noKeySheet);

        expect(result.key).toBe('Unknown');
      });
    });
  });

  describe('validation methods', () => {
    it('should validate correct chord sheet', () => {
      const validChordSheet: ChordSheet = {
        title: 'Valid',
        artist: 'Valid',
        songChords: 'Valid',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      };

      expect(ChordSheetService.isValidChordSheet(validChordSheet)).toBe(true);
    });

    it('should reject invalid data', () => {
      expect(ChordSheetService.isValidChordSheet(null)).toBe(false);
      expect(ChordSheetService.isValidChordSheet('string')).toBe(false);
      expect(ChordSheetService.isValidChordSheet({})).toBe(false);
    });
  });

  describe('legacy transformation', () => {
    it('should migrate legacy chord sheet', () => {
      const legacy: LegacyChordSheet = {
        title: 'Legacy',
        artist: 'Legacy Artist',
        chords: '[C]Legacy[G]',
        key: 'C',
        tuning: 'Standard',
        capo: '2'
      };

      const result = ChordSheetService.migrateLegacyChordSheet(legacy);

      expect(result).toEqual({
        title: 'Legacy',
        artist: 'Legacy Artist',
        songChords: '[C]Legacy[G]',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 2
      });
    });

    it('should convert to legacy format', () => {
      const newFormat: ChordSheet = {
        title: 'New',
        artist: 'New Artist',
        songChords: '[C]New[G]',
        songKey: 'C',
        guitarTuning: GUITAR_TUNINGS.DROP_D,
        guitarCapo: 2
      };

      const result = ChordSheetService.toLegacyFormat(newFormat);

      expect(result).toEqual({
        title: 'New',
        artist: 'New Artist',
        chords: '[C]New[G]',
        key: 'C',
        tuning: 'D A D G B E',
        capo: 2
      });
    });
  });
});
