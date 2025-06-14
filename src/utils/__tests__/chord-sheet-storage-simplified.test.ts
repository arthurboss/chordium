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
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('ChordSheet Storage (Simplified with Song.path as ID)', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const testChordSheet: ChordSheet = {
    path: 'leonardo-goncalves-getsemani',
    title: 'Getsêmani',
    artist: 'Leonardo Gonçalves',
    chords: '[Intro] C7M  C/G  C4  Dm7(5-)\n        C  C/G  F9  Fm6\n\n[Primeira Parte]\n\nC                C7M\n  No  Getsêmani foi',
    key: 'C',
    tuning: 'Standard',
    capo: '2'
  };

  const testId = 'leonardo-goncalves-getsemani'; // Simulating Song.path

  describe('saveChordSheet', () => {
    it('should save a chord sheet with provided ID and return the ID', () => {
      const id = saveChordSheet(testChordSheet, testId);
      
      expect(id).toBe(testId);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'chordSheets',
        JSON.stringify({ [testId]: testChordSheet })
      );
    });

    it('should update existing chord sheet when same ID is used', () => {
      // Save initial chord sheet
      saveChordSheet(testChordSheet, testId);
      
      // Update with new content
      const updatedChordSheet = { ...testChordSheet, chords: 'Updated chords' };
      const id = saveChordSheet(updatedChordSheet, testId);
      
      expect(id).toBe(testId);
      
      // Should have the updated content
      const stored = getChordSheet(testId);
      expect(stored?.chords).toBe('Updated chords');
    });
  });

  describe('getChordSheet', () => {
    it('should retrieve a chord sheet by ID', () => {
      saveChordSheet(testChordSheet, testId);
      const retrieved = getChordSheet(testId);
      
      expect(retrieved).toEqual(testChordSheet);
    });

    it('should return null for non-existent ID', () => {
      const retrieved = getChordSheet('non-existent-id');
      expect(retrieved).toBeNull();
    });
  });

  describe('deleteChordSheet', () => {
    it('should delete a chord sheet by ID', () => {
      saveChordSheet(testChordSheet, testId);
      
      const deleted = deleteChordSheet(testId);
      expect(deleted).toBe(true);
      
      const retrieved = getChordSheet(testId);
      expect(retrieved).toBeNull();
    });

    it('should return false when trying to delete non-existent chord sheet', () => {
      const deleted = deleteChordSheet('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('getAllChordSheets', () => {
    it('should return all chord sheets as an object map', () => {
      const testId2 = 'another-artist-another-song';
      const testChordSheet2 = { ...testChordSheet, title: 'Another Song', artist: 'Another Artist' };
      
      saveChordSheet(testChordSheet, testId);
      saveChordSheet(testChordSheet2, testId2);
      
      const all = getAllChordSheets();
      expect(all).toEqual({
        [testId]: testChordSheet,
        [testId2]: testChordSheet2
      });
    });

    it('should return empty object when no chord sheets exist', () => {
      const all = getAllChordSheets();
      expect(all).toEqual({});
    });
  });

  describe('Data Flow Verification', () => {
    it('should work with Song.path as ID (real-world scenario)', () => {
      // Simulate how it would work in the real app
      const song = {
        path: 'leonardo-goncalves-getsemani',
        title: 'Getsêmani', 
        artist: 'Leonardo Gonçalves'
      };
      
      const chordSheet: ChordSheet = {
        path: song.path,
        title: song.title,
        artist: song.artist,
        chords: 'G C D G...',
        key: 'G',
        tuning: 'Standard',
        capo: '0'
      };
      
      // Save using song.path as ID
      const savedId = saveChordSheet(chordSheet, song.path);
      expect(savedId).toBe(song.path);
      
      // Retrieve using song.path as ID  
      const retrieved = getChordSheet(song.path);
      expect(retrieved?.title).toBe(song.title);
      expect(retrieved?.artist).toBe(song.artist);
    });
  });
});
