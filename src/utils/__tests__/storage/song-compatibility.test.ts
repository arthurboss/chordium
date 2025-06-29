/**
 * Tests for Song compatibility functions in unified-song-storage
 * These test the Song-to-ChordSheet conversion functions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSongs,
  chordSheetToSong,
  deleteSong,
  loadSongs,
  addChordSheet,
} from '@/utils/unified-song-storage';
import { setupLocalStorageMock, createTestChordSheet, SAMPLE_CHORD_SHEETS } from '@/__tests__/shared/test-setup';

describe('Song Compatibility Functions', () => {
  beforeEach(() => {
    setupLocalStorageMock();
    // Clear all cached data to ensure test isolation  
    localStorage.clear();
  });

  describe('chordSheetToSong', () => {
    it('should convert ChordSheet to Song format', () => {
      const chordSheet = createTestChordSheet({
        title: 'Test Song',
        artist: 'Test Artist',
      });

      const song = chordSheetToSong(chordSheet);

      expect(song.title).toBe('Test Song');
      expect(song.artist).toBe('Test Artist');
      expect(song.path).toBe('test_artist-test_song'); // Generated cache key
    });

    it('should handle special characters in artist and title', async () => {
      const wonderwall = await SAMPLE_CHORD_SHEETS.wonderwall();
      const song = chordSheetToSong(wonderwall);

      expect(song.title).toBe('Wonderwall');
      expect(song.artist).toBe('Oasis');
      expect(song.path).toBe('oasis-wonderwall');
    });
  });

  describe('getSongs', () => {
    it('should return empty array when no ChordSheets exist', () => {
      const songs = getSongs();
      expect(songs).toEqual([]);
    });

    it('should convert stored ChordSheets to Song format', () => {
      const chordSheet = createTestChordSheet({
        title: 'Test Song',
        artist: 'Test Artist',
      });
      addChordSheet(chordSheet);

      const songs = getSongs();
      expect(songs).toHaveLength(1);
      expect(songs[0].title).toBe('Test Song');
      expect(songs[0].artist).toBe('Test Artist');
      expect(songs[0].path).toBe('test_artist-test_song');
    });

    it('should handle multiple ChordSheets', async () => {
      const wonderwall = await SAMPLE_CHORD_SHEETS.wonderwall();
      const hotelCalifornia = await SAMPLE_CHORD_SHEETS.hotelCalifornia();
      
      addChordSheet(wonderwall);
      addChordSheet(hotelCalifornia);

      const songs = getSongs();
      expect(songs).toHaveLength(2);
      
      const titles = songs.map(s => s.title);
      expect(titles).toContain('Wonderwall');
      expect(titles).toContain('Hotel California');
    });
  });

  describe('deleteSong', () => {
    it('should delete ChordSheet by song path', () => {
      const chordSheet = createTestChordSheet({
        title: 'Test Song',
        artist: 'Test Artist',
      });
      addChordSheet(chordSheet);

      // Verify it exists
      expect(getSongs()).toHaveLength(1);

      // Delete by path (cache key format)
      deleteSong('test_artist-test_song');

      // Verify it's gone
      expect(getSongs()).toHaveLength(0);
    });

    it('should handle invalid song paths gracefully', () => {
      const chordSheet = createTestChordSheet();
      addChordSheet(chordSheet);

      // Try to delete with invalid path
      deleteSong('invalid-path-format');

      // Should still have the original ChordSheet
      expect(getSongs()).toHaveLength(1);
    });

    it('should not affect other songs when deleting one', async () => {
      const wonderwall = await SAMPLE_CHORD_SHEETS.wonderwall();
      const hotelCalifornia = await SAMPLE_CHORD_SHEETS.hotelCalifornia();
      
      addChordSheet(wonderwall);
      addChordSheet(hotelCalifornia);
      expect(getSongs()).toHaveLength(2);

      // Delete Wonderwall
      deleteSong('oasis-wonderwall');

      const remaining = getSongs();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].title).toBe('Hotel California');
    });
  });

  describe('loadSongs compatibility', () => {
    it('should return ChordSheets converted to Song format', async () => {
      const wonderwall = await SAMPLE_CHORD_SHEETS.wonderwall();
      addChordSheet(wonderwall);

      // loadSongs ignores the input parameter and returns existing ChordSheets as Songs
      const songs = loadSongs([]);

      expect(songs).toHaveLength(1);
      expect(songs[0].title).toBe('Wonderwall');
      expect(songs[0].artist).toBe('Oasis');
      expect(songs[0].path).toBe('oasis-wonderwall');
    });

    it('should handle empty storage', () => {
      const songs = loadSongs([]);
      expect(songs).toEqual([]);
    });
  });
});
