import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestableChordSheetRepository } from '../../testing/testable-chord-sheet-repository';
import { ChordSheetFixtureLoader } from '../../testing/chord-sheet-fixture-loader';

describe('ChordSheetRepository - Path-Based Keys', () => {
  let repository: TestableChordSheetRepository;

  beforeEach(async () => {
    repository = new TestableChordSheetRepository();
    await repository.initialize();
  });

  afterEach(async () => {
    await repository.clear();
    await repository.close();
  });

  describe('storeByPath', () => {
    it('should store chord sheet using path as key', async () => {
      const chordSheet = ChordSheetFixtureLoader.loadChordSheet('oasis-wonderwall');
      const path = 'oasis/wonderwall';
      
      await repository.storeByPath(path, chordSheet, { saved: false });
      
      const stored = await repository.getByPath(path);
      
      expect(stored).toBeDefined();
      expect(stored?.chordSheet.title).toBe('Wonderwall');
      expect(stored?.chordSheet.artist).toBe('Oasis');
      expect(stored?.metadata.saved).toBe(false);
    });

    it('should handle paths with hyphens and slashes', async () => {
      const chordSheet = ChordSheetFixtureLoader.loadChordSheet('eagles-hotel_california');
      const path = 'eagles/hotel-california';
      
      await repository.storeByPath(path, chordSheet, { saved: true });
      
      const stored = await repository.getByPath(path);
      
      expect(stored).toBeDefined();
      expect(stored?.chordSheet.title).toBe('Hotel California');
      expect(stored?.chordSheet.artist).toBe('Eagles');
      expect(stored?.metadata.saved).toBe(true);
    });

    it('should handle different song paths', async () => {
      const chordSheet = ChordSheetFixtureLoader.loadChordSheet('radiohead-creep');
      const path = 'radiohead/creep';
      
      await repository.storeByPath(path, chordSheet, { saved: false });
      
      const stored = await repository.getByPath(path);
      
      expect(stored).toBeDefined();
      expect(stored?.chordSheet.title).toBe('Creep');
      expect(stored?.chordSheet.artist).toBe('Radiohead');
    });
  });

  describe('getByPath', () => {
    it('should return null for non-existent path', async () => {
      const stored = await repository.getByPath('non-existent/path');
      expect(stored).toBeNull();
    });

    it('should handle expired cached items', async () => {
      const chordSheet = ChordSheetFixtureLoader.loadChordSheet('oasis-wonderwall');
      const path = 'oasis/wonderwall';
      
      // Store with past expiration date
      await repository.storeByPath(path, chordSheet, { 
        saved: false,
        expiresAt: Date.now() - 1000 // 1 second ago
      });
      
      const stored = await repository.getByPath(path);
      expect(stored).toBeNull();
    });
  });

  describe('deleteByPath', () => {
    it('should delete chord sheet by path', async () => {
      const chordSheet = ChordSheetFixtureLoader.loadChordSheet('oasis-wonderwall');
      const path = 'oasis/wonderwall';
      
      await repository.storeByPath(path, chordSheet, { saved: false });
      
      // Verify it exists
      let stored = await repository.getByPath(path);
      expect(stored).toBeDefined();
      
      // Delete it
      await repository.deleteByPath(path);
      
      // Verify it's gone
      stored = await repository.getByPath(path);
      expect(stored).toBeNull();
    });
  });

  describe('isSavedByPath', () => {
    it('should return true for saved chord sheets', async () => {
      const chordSheet = ChordSheetFixtureLoader.loadChordSheet('oasis-wonderwall');
      const path = 'oasis/wonderwall';
      
      await repository.storeByPath(path, chordSheet, { saved: true });
      
      const isSaved = await repository.isSavedByPath(path);
      expect(isSaved).toBe(true);
    });

    it('should return false for cached chord sheets', async () => {
      const chordSheet = ChordSheetFixtureLoader.loadChordSheet('oasis-wonderwall');
      const path = 'oasis/wonderwall';
      
      await repository.storeByPath(path, chordSheet, { saved: false });
      
      const isSaved = await repository.isSavedByPath(path);
      expect(isSaved).toBe(false);
    });

    it('should return false for non-existent chord sheets', async () => {
      const isSaved = await repository.isSavedByPath('non-existent/path');
      expect(isSaved).toBe(false);
    });
  });

  describe('toggleSaveByPath', () => {
    it('should save a cached chord sheet', async () => {
      const chordSheet = ChordSheetFixtureLoader.loadChordSheet('oasis-wonderwall');
      const path = 'oasis/wonderwall';
      
      // Cache it first
      await repository.storeByPath(path, chordSheet, { saved: false });
      
      // Toggle save
      await repository.toggleSaveByPath(path);
      
      // Verify it's saved
      const isSaved = await repository.isSavedByPath(path);
      expect(isSaved).toBe(true);
    });

    it('should unsave a saved chord sheet', async () => {
      const chordSheet = ChordSheetFixtureLoader.loadChordSheet('oasis-wonderwall');
      const path = 'oasis/wonderwall';
      
      // Save it first
      await repository.storeByPath(path, chordSheet, { saved: true });
      
      // Toggle save
      await repository.toggleSaveByPath(path);
      
      // Verify it's cached (not saved)
      const isSaved = await repository.isSavedByPath(path);
      expect(isSaved).toBe(false);
    });
  });
});
