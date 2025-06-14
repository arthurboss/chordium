import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChordSheet } from '@/types/chordSheet';
import {
  getChordSheet,
  saveChordSheet,
  saveChordSheetByArtistTitle,
  deleteChordSheet,
  getAllChordSheetIds,
  getAllChordSheets,
  clearAllChordSheets
} from '../chord-sheet-storage';

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  })
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('ChordSheet Storage', () => {
  const sampleChordSheet: ChordSheet = {
    title: 'Getsêmani',
    artist: 'Leonardo Gonçalves',
    chords: 'G D Em C\nVerse 1: G D Em C...',
    key: 'G',
    tuning: 'Standard',
    capo: '3rd fret'
  };

  const sampleId = 'leonardo_goncalves-getsemani';

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    // Reset any mocked implementations
    vi.restoreAllMocks();
  });

  describe('saveChordSheet', () => {
    it('should save a chord sheet with the given ID', () => {
      saveChordSheet(sampleId, sampleChordSheet);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'chord-sheets',
        JSON.stringify({
          [sampleId]: sampleChordSheet
        })
      );
    });

    it('should normalize chord sheet data with defaults', () => {
      const incompleteChordSheet = {
        title: 'Test Song',
        artist: '',
        chords: 'G C D',
        key: '',
        tuning: '',
        capo: ''
      } as ChordSheet;

      saveChordSheet(sampleId, incompleteChordSheet);

      const stored = JSON.parse(localStorageMock.store['chord-sheets']);
      expect(stored[sampleId]).toEqual({
        title: 'Test Song',
        artist: 'Unknown Artist', // Default for empty artist
        chords: 'G C D',
        key: '',
        tuning: '',
        capo: ''
      });
    });

    it('should add to existing chord sheets without overwriting others', () => {
      const firstId = 'first-song';
      const secondId = 'second-song';
      const firstChordSheet: ChordSheet = {
        title: 'First',
        artist: 'Artist 1',
        chords: 'G C',
        key: 'G',
        tuning: 'Standard',
        capo: ''
      };

      saveChordSheet(firstId, firstChordSheet);
      saveChordSheet(secondId, sampleChordSheet);

      const stored = JSON.parse(localStorageMock.store['chord-sheets']);
      expect(stored).toHaveProperty(firstId);
      expect(stored).toHaveProperty(secondId);
      expect(stored[firstId]).toEqual(firstChordSheet);
      expect(stored[secondId].title).toBe('Getsêmani');
    });

    it('should handle localStorage errors gracefully', () => {
      const setItemSpy = vi.spyOn(localStorageMock, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage full');
      });

      expect(() => saveChordSheet(sampleId, sampleChordSheet)).toThrow('Failed to save chord sheet to localStorage');
    });
  });

  describe('getChordSheet', () => {
    it('should return null when no chord sheets are stored', () => {
      const result = getChordSheet(sampleId);
      expect(result).toBeNull();
    });

    it('should return null when requested ID does not exist', () => {
      saveChordSheet('other-id', sampleChordSheet);
      const result = getChordSheet(sampleId);
      expect(result).toBeNull();
    });

    it('should return the correct chord sheet for valid ID', () => {
      saveChordSheet(sampleId, sampleChordSheet);
      const result = getChordSheet(sampleId);
      expect(result).toEqual(sampleChordSheet);
    });

    it('should validate stored object structure', () => {
      // Manually store invalid data
      const invalidData = {
        [sampleId]: {
          title: 'Test',
          // Missing required fields
          chords: 'G C'
        }
      };
      localStorageMock.store['chord-sheets'] = JSON.stringify(invalidData);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = getChordSheet(sampleId);
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(`Invalid chord sheet data found for ID: ${sampleId}`);
      
      consoleSpy.mockRestore();
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorageMock.store['chord-sheets'] = 'invalid json';
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = getChordSheet(sampleId);
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('saveChordSheetByArtistTitle', () => {
    it('should generate ID and save chord sheet', () => {
      const id = saveChordSheetByArtistTitle('Leonardo Gonçalves', 'Getsêmani', sampleChordSheet);
      
      expect(id).toBe('leonardo_goncalves-getsemani');
      
      const retrieved = getChordSheet(id);
      expect(retrieved).toEqual(sampleChordSheet);
    });

    it('should handle special characters in artist and title', () => {
      const specialChordSheet: ChordSheet = {
        title: 'São Paulo',
        artist: 'André & João',
        chords: 'Am F G',
        key: 'Am',
        tuning: 'Standard',
        capo: ''
      };

      const id = saveChordSheetByArtistTitle('André & João', 'São Paulo', specialChordSheet);
      
      expect(id).toBe('andre_&_joao-sao_paulo');
      
      const retrieved = getChordSheet(id);
      expect(retrieved).toEqual(specialChordSheet);
    });
  });

  describe('deleteChordSheet', () => {
    it('should return false when no chord sheets are stored', () => {
      const result = deleteChordSheet(sampleId);
      expect(result).toBe(false);
    });

    it('should return false when ID does not exist', () => {
      saveChordSheet('other-id', sampleChordSheet);
      const result = deleteChordSheet(sampleId);
      expect(result).toBe(false);
    });

    it('should delete existing chord sheet and return true', () => {
      saveChordSheet(sampleId, sampleChordSheet);
      
      const result = deleteChordSheet(sampleId);
      expect(result).toBe(true);
      
      const retrieved = getChordSheet(sampleId);
      expect(retrieved).toBeNull();
    });

    it('should not affect other chord sheets when deleting one', () => {
      const otherId = 'other-song';
      const otherChordSheet: ChordSheet = {
        title: 'Other Song',
        artist: 'Other Artist',
        chords: 'D G A',
        key: 'D',
        tuning: 'Standard',
        capo: ''
      };

      saveChordSheet(sampleId, sampleChordSheet);
      saveChordSheet(otherId, otherChordSheet);

      deleteChordSheet(sampleId);

      expect(getChordSheet(sampleId)).toBeNull();
      expect(getChordSheet(otherId)).toEqual(otherChordSheet);
    });

    it('should handle localStorage errors gracefully', () => {
      saveChordSheet(sampleId, sampleChordSheet);
      
      const setItemSpy = vi.spyOn(localStorageMock, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = deleteChordSheet(sampleId);
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
      setItemSpy.mockRestore();
    });
  });

  describe('getAllChordSheetIds', () => {
    it('should return empty array when no chord sheets are stored', () => {
      const ids = getAllChordSheetIds();
      expect(ids).toEqual([]);
    });

    it('should return all stored chord sheet IDs', () => {
      const id1 = 'artist1-song1';
      const id2 = 'artist2-song2';
      
      saveChordSheet(id1, sampleChordSheet);
      saveChordSheet(id2, sampleChordSheet);

      const ids = getAllChordSheetIds();
      expect(ids).toContain(id1);
      expect(ids).toContain(id2);
      expect(ids).toHaveLength(2);
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorageMock.store['chord-sheets'] = 'invalid json';
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const ids = getAllChordSheetIds();
      
      expect(ids).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('getAllChordSheets', () => {
    it('should return empty object when no chord sheets are stored', () => {
      const chordSheets = getAllChordSheets();
      expect(chordSheets).toEqual({});
    });

    it('should return all stored chord sheets', () => {
      const id1 = 'artist1-song1';
      const id2 = 'artist2-song2';
      
      saveChordSheet(id1, sampleChordSheet);
      saveChordSheet(id2, sampleChordSheet);

      const chordSheets = getAllChordSheets();
      expect(chordSheets).toHaveProperty(id1);
      expect(chordSheets).toHaveProperty(id2);
      expect(chordSheets[id1]).toEqual(sampleChordSheet);
      expect(chordSheets[id2]).toEqual(sampleChordSheet);
    });

    it('should handle JSON parse errors gracefully', () => {
      localStorageMock.store['chord-sheets'] = 'invalid json';
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const chordSheets = getAllChordSheets();
      
      expect(chordSheets).toEqual({});
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('clearAllChordSheets', () => {
    it('should remove all chord sheets from localStorage', () => {
      saveChordSheet(sampleId, sampleChordSheet);
      saveChordSheet('other-id', sampleChordSheet);

      clearAllChordSheets();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('chord-sheets');
      expect(getAllChordSheets()).toEqual({});
    });

    it('should handle localStorage errors gracefully', () => {
      const removeItemSpy = vi.spyOn(localStorageMock, 'removeItem');
      removeItemSpy.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => clearAllChordSheets()).toThrow('Failed to clear chord sheets from localStorage');
      
      removeItemSpy.mockRestore();
    });
  });
});
