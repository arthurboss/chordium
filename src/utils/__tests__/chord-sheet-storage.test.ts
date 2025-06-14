import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChordSheet } from '@/types/chordSheet';
import {
  getChordSheet,
  saveChordSheet,
  deleteChordSheet,
  getAllChordSheets
} from '../chord-sheet-storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    getStore: () => store
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('ChordSheet Storage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const testChordSheet: ChordSheet = {
    title: 'Getsêmani',
    artist: 'Leonardo Gonçalves',
    chords: '[Intro] C7M  C/G  C4  Dm7(5-)\n        C  C/G  F9  Fm6\n\n[Primeira Parte]\n\nC                C7M\n  No  Getsêmani foi',
    key: 'C',
    tuning: 'Standard',
    capo: '2'
  };

  describe('generateChordSheetId', () => {
    it('should generate a consistent ID from artist and title', () => {
      const id1 = generateChordSheetId('Leonardo Gonçalves', 'Getsêmani');
      const id2 = generateChordSheetId('Leonardo Gonçalves', 'Getsêmani');
      
      expect(id1).toBe(id2);
      expect(id1).toBe('leonardo-goncalves-getsemani');
    });

    it('should handle special characters and normalize diacritics', () => {
      const id = generateChordSheetId('José María', 'Canción Especial');
      expect(id).toBe('jose-maria-cancion-especial');
    });

    it('should handle empty or undefined values', () => {
      const id1 = generateChordSheetId('', 'Title');
      const id2 = generateChordSheetId('Artist', '');
      
      expect(id1).toBe('unknown-artist-title');
      expect(id2).toBe('artist-untitled-song');
    });
  });

  describe('saveChordSheet', () => {
    it('should save a chord sheet to localStorage', () => {
      const id = saveChordSheet(testChordSheet);
      
      expect(id).toBe('leonardo-goncalves-getsemani');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'chordSheets',
        JSON.stringify({
          'leonardo-goncalves-getsemani': testChordSheet
        })
      );
    });

    it('should update existing chord sheet with same ID', () => {
      // Save first chord sheet
      saveChordSheet(testChordSheet);
      
      // Save updated version
      const updatedChordSheet = {
        ...testChordSheet,
        key: 'G',
        chords: 'Updated chord content'
      };
      
      const id = saveChordSheet(updatedChordSheet);
      
      expect(id).toBe('leonardo-goncalves-getsemani');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'chordSheets',
        JSON.stringify({
          'leonardo-goncalves-getsemani': updatedChordSheet
        })
      );
    });
  });

  describe('getChordSheet', () => {
    it('should retrieve a chord sheet by ID', () => {
      // Setup
      const chordSheets = {
        'leonardo-goncalves-getsemani': testChordSheet
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(chordSheets));
      
      // Test
      const result = getChordSheet('leonardo-goncalves-getsemani');
      
      expect(result).toEqual(testChordSheet);
    });

    it('should return null for non-existent chord sheet', () => {
      localStorageMock.getItem.mockReturnValue('{}');
      
      const result = getChordSheet('non-existent-id');
      
      expect(result).toBeNull();
    });

    it('should return null when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = getChordSheet('any-id');
      
      expect(result).toBeNull();
    });
  });

  describe('deleteChordSheet', () => {
    it('should remove a chord sheet by ID', () => {
      // Setup
      const chordSheets = {
        'leonardo-goncalves-getsemani': testChordSheet,
        'other-artist-other-song': { ...testChordSheet, title: 'Other Song' }
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(chordSheets));
      
      // Test
      const success = deleteChordSheet('leonardo-goncalves-getsemani');
      
      expect(success).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'chordSheets',
        JSON.stringify({
          'other-artist-other-song': { ...testChordSheet, title: 'Other Song' }
        })
      );
    });

    it('should return false for non-existent chord sheet', () => {
      localStorageMock.getItem.mockReturnValue('{}');
      
      const success = deleteChordSheet('non-existent-id');
      
      expect(success).toBe(false);
    });
  });

  describe('getAllChordSheets', () => {
    it('should return all chord sheets', () => {
      const chordSheets = {
        'leonardo-goncalves-getsemani': testChordSheet,
        'other-artist-other-song': { ...testChordSheet, title: 'Other Song' }
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(chordSheets));
      
      const result = getAllChordSheets();
      
      expect(result).toEqual(chordSheets);
    });

    it('should return empty object when no chord sheets exist', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = getAllChordSheets();
      
      expect(result).toEqual({});
    });
  });
});
