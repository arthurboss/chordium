/**
 * Tests for ChordSheet storage operations in unified-song-storage
 * Focuses on the modern ChordSheet-based stor  describe('loadChordSheets with real sample data', () => {
    it('should load initial ChordSheets when storage is empty', async () => {
      const testSong = await SAMPLE_CHORD_SHEETS.creep();
      const initialChordSheets = [testSong];

      const result = loadChordSheets(initialChordSheets);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(testSong);ionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getChordSheets,
  addChordSheet,
  updateChordSheet,
  deleteChordSheet,
  loadChordSheets,
} from '@/utils/unified-song-storage';
import { setupLocalStorageMock, createTestChordSheet, SAMPLE_CHORD_SHEETS } from '@/__tests__/shared/test-setup';

describe('ChordSheet Storage Operations', () => {
  beforeEach(() => {
    setupLocalStorageMock();
    // Clear all cached data to ensure test isolation
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('addChordSheet', () => {
    it('should add a ChordSheet to storage', async () => {
      const testChordSheet = createTestChordSheet({
        title: 'Wonderwall',
        artist: 'Oasis',
      });

      addChordSheet(testChordSheet);
      const chordSheets = getChordSheets();

      expect(chordSheets).toHaveLength(1);
      expect(chordSheets[0]).toEqual(testChordSheet);
    });

    it('should add multiple ChordSheets', () => {
      const chordSheet1 = createTestChordSheet({ title: 'Song 1', artist: 'Artist 1' });
      const chordSheet2 = createTestChordSheet({ title: 'Song 2', artist: 'Artist 2' });

      addChordSheet(chordSheet1);
      addChordSheet(chordSheet2);

      const chordSheets = getChordSheets();
      expect(chordSheets).toHaveLength(2);
    });
  });

  describe('getChordSheets', () => {
    it('should return empty array when no ChordSheets exist', () => {
      const chordSheets = getChordSheets();
      expect(chordSheets).toEqual([]);
    });

    it('should return all stored ChordSheets', () => {
      const testChordSheet = createTestChordSheet();
      addChordSheet(testChordSheet);

      const chordSheets = getChordSheets();
      expect(chordSheets).toHaveLength(1);
      expect(chordSheets[0]).toEqual(testChordSheet);
    });
  });

  describe('updateChordSheet', () => {
    it('should update an existing ChordSheet', () => {
      const originalChordSheet = createTestChordSheet({
        title: 'Test Song',
        artist: 'Test Artist',
        songKey: 'C',
        songChords: 'Original chords'
      });

      addChordSheet(originalChordSheet);

      const updatedChordSheet = {
        ...originalChordSheet,
        songKey: 'G',
        songChords: 'Updated chords'
      };

      updateChordSheet(updatedChordSheet);

      const chordSheets = getChordSheets();
      expect(chordSheets).toHaveLength(1);
      expect(chordSheets[0].songKey).toBe('G');
      expect(chordSheets[0].songChords).toBe('Updated chords');
    });
  });

  describe('deleteChordSheet', () => {
    it('should remove a ChordSheet from storage', () => {
      const testChordSheet = createTestChordSheet({
        title: 'To Be Deleted',
        artist: 'Test Artist',
      });

      addChordSheet(testChordSheet);
      expect(getChordSheets()).toHaveLength(1);

      deleteChordSheet(testChordSheet.title, testChordSheet.artist);
      expect(getChordSheets()).toHaveLength(0);
    });

    it('should not affect other ChordSheets when deleting one', () => {
      const chordSheet1 = createTestChordSheet({ title: 'Keep This', artist: 'Artist 1' });
      const chordSheet2 = createTestChordSheet({ title: 'Delete This', artist: 'Artist 2' });

      addChordSheet(chordSheet1);
      addChordSheet(chordSheet2);
      expect(getChordSheets()).toHaveLength(2);

      deleteChordSheet(chordSheet2.title, chordSheet2.artist);
      
      const remaining = getChordSheets();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].title).toBe('Keep This');
    });
  });

  describe('loadChordSheets with real sample data', () => {
    it('should load initial ChordSheets when storage is empty', async () => {
      const wonderwall = await SAMPLE_CHORD_SHEETS.wonderwall();
      const initialChordSheets = [wonderwall];

      const result = loadChordSheets(initialChordSheets);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Wonderwall');
      expect(result[0].artist).toBe('Oasis');
      expect(result[0].songKey).toBe('G');
    });

    it('should merge initial and existing ChordSheets without duplicates', async () => {
      // Add an existing ChordSheet
      const existingChordSheet = createTestChordSheet({
        title: 'Existing Song',
        artist: 'Existing Artist',
      });
      addChordSheet(existingChordSheet);

      // Load with sample ChordSheets
      const wonderwall = await SAMPLE_CHORD_SHEETS.wonderwall();
      const hotelCalifornia = await SAMPLE_CHORD_SHEETS.hotelCalifornia();
      const initialChordSheets = [wonderwall, hotelCalifornia];

      const result = loadChordSheets(initialChordSheets);

      expect(result).toHaveLength(3); // 1 existing + 2 new
      expect(result.some(cs => cs.title === 'Existing Song')).toBe(true);
      expect(result.some(cs => cs.title === 'Wonderwall')).toBe(true);
      expect(result.some(cs => cs.title === 'Hotel California')).toBe(true);
    });

    it('should not duplicate ChordSheets that already exist', async () => {
      // Add Wonderwall first
      const wonderwall = await SAMPLE_CHORD_SHEETS.wonderwall();
      addChordSheet(wonderwall);

      // Try to load it again
      const initialChordSheets = [wonderwall];
      const result = loadChordSheets(initialChordSheets);

      expect(result).toHaveLength(1); // Should not duplicate
      expect(result[0].title).toBe('Wonderwall');
    });
  });
});
