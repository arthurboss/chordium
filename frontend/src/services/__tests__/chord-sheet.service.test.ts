import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createChordSheet,
  getChordSheet,
  saveChordSheet,
  hasChordSheetContent,
  getChordContent,
  getTuningDisplay,
  getCapoDisplay,
  getMetadata
} from '../chord-sheet.service';
import { ChordSheet } from '../../types/chordSheet';
import { GUITAR_TUNINGS } from '../../constants/guitar-tunings';

// Mock the cache module
vi.mock('../../cache/implementations/unified-chord-sheet-cache', () => ({
  unifiedChordSheetCache: {
    getCachedChordSheet: vi.fn(),
    cacheChordSheet: vi.fn()
  }
}));

import { unifiedChordSheetCache } from '../../cache/implementations/unified-chord-sheet-cache';

const mockGetCachedChordSheet = vi.mocked(unifiedChordSheetCache.getCachedChordSheet);
const mockCacheChordSheet = vi.mocked(unifiedChordSheetCache.cacheChordSheet);

// Real sample songs for testing
const hotelCaliforniaChordSheet: ChordSheet = {
  title: "Hotel California",
  artist: "Eagles",
  songChords: "[Intro]\nBm  F#  A  E  G  D  Em  F#\n\n[Verse 1]\nBm                        F#\nOn a dark desert highway, cool wind in my hair",
  songKey: "Bm",
  guitarTuning: GUITAR_TUNINGS.STANDARD,
  guitarCapo: 0
};

const wonderwallChordSheet: ChordSheet = {
  title: "Wonderwall",
  artist: "Oasis", 
  songChords: "[Intro]\nEm7  G  Dsus4  A7sus4\n\n[Verse 1]\nEm7             G\nToday is gonna be the day",
  songKey: "G",
  guitarTuning: GUITAR_TUNINGS.STANDARD,
  guitarCapo: 0
};

describe('ChordSheet Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getChordSheet', () => {
    it('should return null when no chord sheet is cached', () => {
      mockGetCachedChordSheet.mockReturnValue(null);

      const result = getChordSheet('Eagles', 'Hotel California');

      expect(result).toBeNull();
      expect(mockGetCachedChordSheet).toHaveBeenCalledWith('Eagles', 'Hotel California');
    });

    it('should return cached chord sheet when available', () => {
      mockGetCachedChordSheet.mockReturnValue(hotelCaliforniaChordSheet);

      const result = getChordSheet('Eagles', 'Hotel California');

      expect(result).toEqual(hotelCaliforniaChordSheet);
      expect(mockGetCachedChordSheet).toHaveBeenCalledWith('Eagles', 'Hotel California');
    });
  });

  describe('saveChordSheet', () => {
    it('should cache a chord sheet', () => {
      saveChordSheet('Eagles', 'Hotel California', hotelCaliforniaChordSheet);

      expect(mockCacheChordSheet).toHaveBeenCalledWith('Eagles', 'Hotel California', hotelCaliforniaChordSheet);
    });
  });

  describe('createChordSheet', () => {
    it('should create chord sheet with defaults when no data provided', () => {
      const result = createChordSheet({});

      expect(result).toEqual({
        title: '',
        artist: 'Unknown Artist',
        songChords: '',
        songKey: '',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      });
    });

    it('should create chord sheet with provided data', () => {
      const partialData = {
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: 'C G Am F'
      };

      const result = createChordSheet(partialData);

      expect(result).toEqual({
        title: 'Test Song',
        artist: 'Test Artist',
        songChords: 'C G Am F',
        songKey: '',
        guitarTuning: GUITAR_TUNINGS.STANDARD,
        guitarCapo: 0
      });
    });
  });

  describe('hasChordSheetContent', () => {
    it('should return true when chord sheet has content', () => {
      const result = hasChordSheetContent(hotelCaliforniaChordSheet);

      expect(result).toBe(true);
    });

    it('should return false when chord sheet has no content', () => {
      const emptySheet: ChordSheet = {
        ...hotelCaliforniaChordSheet,
        songChords: ''
      };

      const result = hasChordSheetContent(emptySheet);

      expect(result).toBe(false);
    });

    it('should return false when chord sheet is null', () => {
      const result = hasChordSheetContent(null);

      expect(result).toBe(false);
    });
  });

  describe('getChordContent', () => {
    it('should extract chord content from chord sheet', () => {
      const result = getChordContent(hotelCaliforniaChordSheet);

      expect(result).toBe(hotelCaliforniaChordSheet.songChords);
    });

    it('should return empty string when chord sheet is null', () => {
      const result = getChordContent(null);

      expect(result).toBe('');
    });
  });

  describe('getTuningDisplay', () => {
    it('should return tuning display string', () => {
      const result = getTuningDisplay(hotelCaliforniaChordSheet);

      expect(result).toBe('E A D G B E');
    });

    it('should return empty string when chord sheet is null', () => {
      const result = getTuningDisplay(null);

      expect(result).toBe('');
    });
  });

  describe('getCapoDisplay', () => {
    it('should return "No capo" when capo is 0', () => {
      const result = getCapoDisplay(hotelCaliforniaChordSheet);

      expect(result).toBe('No capo');
    });

    it('should return capo display when capo is set', () => {
      const capoSheet: ChordSheet = {
        ...hotelCaliforniaChordSheet,
        guitarCapo: 3
      };

      const result = getCapoDisplay(capoSheet);

      expect(result).toBe('Capo 3');
    });

    it('should return "No capo" when chord sheet is null', () => {
      const result = getCapoDisplay(null);

      expect(result).toBe('No capo');
    });
  });

  describe('getMetadata', () => {
    it('should return complete metadata for valid chord sheet', () => {
      const result = getMetadata(hotelCaliforniaChordSheet);

      expect(result).toEqual({
        title: 'Hotel California',
        artist: 'Eagles',
        key: 'Bm',
        tuning: 'E A D G B E',
        capo: 'No capo',
        hasContent: true
      });
    });

    it('should return default metadata when chord sheet is null', () => {
      const result = getMetadata(null);

      expect(result).toEqual({
        title: '',
        artist: 'Unknown Artist',
        key: '',
        tuning: '',
        capo: 'No capo',
        hasContent: false
      });
    });

    it('should handle missing key gracefully', () => {
      const noKeySheet: ChordSheet = {
        ...hotelCaliforniaChordSheet,
        songKey: ''
      };

      const result = getMetadata(noKeySheet);

      expect(result.key).toBe('Unknown');
    });
  });
});
