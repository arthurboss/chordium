/**
 * Tests for chord sheet store operations
 * Following TDD - tests written first to guide implementation
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChordSheetStore } from '../store';
import { sampleChordSheet, sampleSong } from './fixtures';

describe('ChordSheetStore', () => {
  let store: ChordSheetStore;

  beforeEach(() => {
    store = new ChordSheetStore();
  });

  afterEach(async () => {
    // Clean up test data
    await store.deleteAll();
  });

  describe('store', () => {
    it('should store a chord sheet with saved metadata', async () => {
      await store.store(sampleChordSheet, { saved: true });
      
      const stored = await store.get(sampleSong.artist, sampleSong.title);
      expect(stored).toBeDefined();
      expect(stored?.chordSheet).toEqual(sampleChordSheet);
      expect(stored?.saved).toBe(true);
      expect(stored?.lastAccessed).toBeTypeOf('number');
      expect(stored?.accessCount).toBe(1);
    });

    it('should store a chord sheet with cached metadata', async () => {
      await store.store(sampleChordSheet, { saved: false });
      
      const stored = await store.get(sampleSong.artist, sampleSong.title);
      expect(stored).toBeDefined();
      expect(stored?.saved).toBe(false);
      expect(stored?.expiresAt).toBeTypeOf('number');
      expect(stored?.lastAccessed).toBeTypeOf('number');
      expect(stored?.accessCount).toBe(1);
    });

    it('should update lastAccessed when chord sheet is accessed', async () => {
      await store.store(sampleChordSheet, { saved: true });
      
      const firstAccess = await store.get(sampleSong.artist, sampleSong.title);
      const firstAccessTime = firstAccess?.lastAccessed;
      
      // Simulate some time passing
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Access again - should update lastAccessed
      const secondAccess = await store.get(sampleSong.artist, sampleSong.title);
      
      expect(firstAccessTime).toBeTypeOf('number');
      expect(secondAccess?.lastAccessed).toBeGreaterThan(firstAccessTime ?? 0);
      expect(secondAccess?.accessCount).toBe(2);
    });
  });

  describe('getAllSaved', () => {
    it('should return only saved chord sheets', async () => {
      // Store one saved and one cached
      await store.store(sampleChordSheet, { saved: true });
      await store.store({ ...sampleChordSheet, title: 'Cached Song' }, { saved: false });
      
      const saved = await store.getAllSaved();
      expect(saved).toHaveLength(1);
      expect(saved[0].saved).toBe(true);
      expect(saved[0].chordSheet.title).toBe(sampleChordSheet.title);
    });

    it('should return empty array when no saved sheets exist', async () => {
      const saved = await store.getAllSaved();
      expect(saved).toHaveLength(0);
    });
  });

  describe('get', () => {
    it('should return stored chord sheet', async () => {
      await store.store(sampleChordSheet, { saved: true });
      
      const stored = await store.get(sampleSong.artist, sampleSong.title);
      expect(stored?.chordSheet).toEqual(sampleChordSheet);
    });

    it('should return null for non-existent chord sheet', async () => {
      const stored = await store.get('Unknown', 'Song');
      expect(stored).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete existing chord sheet', async () => {
      await store.store(sampleChordSheet, { saved: true });
      
      await store.delete(sampleSong.artist, sampleSong.title);
      
      const stored = await store.get(sampleSong.artist, sampleSong.title);
      expect(stored).toBeNull();
    });

    it('should not throw when deleting non-existent chord sheet', async () => {
      await expect(store.delete('Unknown', 'Song')).resolves.toBeUndefined();
    });
  });
});
