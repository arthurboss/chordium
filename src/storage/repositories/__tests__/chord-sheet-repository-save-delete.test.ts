import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChordSheetRepository } from '../chord-sheet-repository';
import { ChordSheet } from '@/types/chordSheet';

describe('ChordSheetRepository - Save/Delete Operations', () => {
  let repository: ChordSheetRepository;
  
  const mockChordSheet: ChordSheet = {
    title: 'Test Song',
    artist: 'Test Artist',
    songChords: 'C G Am F',
    songKey: 'C',
    guitarCapo: 0,
    guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E']
  };

  beforeEach(async () => {
    repository = new ChordSheetRepository();
    await repository.initialize();
  });

  afterEach(async () => {
    await repository.close();
  });

  describe('Save Operation (TDD)', () => {
    it('should update existing cached record to saved: true instead of creating duplicate', async () => {
      // Arrange: First cache the chord sheet (saved: false)
      await repository.cache('Test Artist', 'Test Song', mockChordSheet);
      
      // Verify it's cached but not saved
      const allRecords = await repository.getAllSaved();
      expect(allRecords).toHaveLength(0); // Not in "My Chord Sheets" yet
      
      const cachedRecord = await repository.get('Test Artist', 'Test Song');
      expect(cachedRecord).toBeTruthy();
      
      // Act: Save the same chord sheet (should update, not duplicate)
      await repository.save('Test Artist', 'Test Song', mockChordSheet);
      
      // Assert: Should now appear in "My Chord Sheets"
      const savedRecords = await repository.getAllSaved();
      expect(savedRecords).toHaveLength(1);
      expect(savedRecords[0].title).toBe('Test Song');
      expect(savedRecords[0].artist).toBe('Test Artist');
      
      // Verify no duplicate records exist
      const isSaved = await repository.isSaved('Test Artist', 'Test Song');
      expect(isSaved).toBe(true);
    });

    it('should work even if chord sheet was not previously cached', async () => {
      // Act: Save a chord sheet that was never cached
      await repository.save('New Artist', 'New Song', {
        ...mockChordSheet,
        title: 'New Song',
        artist: 'New Artist'
      });
      
      // Assert: Should appear in "My Chord Sheets"
      const savedRecords = await repository.getAllSaved();
      expect(savedRecords).toHaveLength(1);
      expect(savedRecords[0].title).toBe('New Song');
    });
  });

  describe('Delete Operation (TDD)', () => {
    it('should update saved record to saved: false instead of removing it', async () => {
      // Arrange: Cache and save a chord sheet
      await repository.cache('Test Artist', 'Test Song', mockChordSheet);
      await repository.save('Test Artist', 'Test Song', mockChordSheet);
      
      // Verify it's in "My Chord Sheets"
      const savedRecords = await repository.getAllSaved();
      expect(savedRecords).toHaveLength(1);
      
      // Act: Delete from "My Chord Sheets" (should set saved: false)
      await repository.removeFromSaved('Test Artist', 'Test Song');
      
      // Assert: Should no longer appear in "My Chord Sheets"
      const afterDeleteSaved = await repository.getAllSaved();
      expect(afterDeleteSaved).toHaveLength(0);
      
      // But should still be available in cache (for future viewing)
      const cachedRecord = await repository.get('Test Artist', 'Test Song');
      expect(cachedRecord).toBeTruthy();
      expect(cachedRecord.title).toBe('Test Song');
      
      // Verify it's marked as not saved
      const isSaved = await repository.isSaved('Test Artist', 'Test Song');
      expect(isSaved).toBe(false);
    });
  });

  describe('My Chord Sheets Filtering (TDD)', () => {
    it('should only return records where saved: true', async () => {
      // Arrange: Create multiple records with different saved states
      await repository.cache('Artist 1', 'Song 1', { ...mockChordSheet, title: 'Song 1', artist: 'Artist 1' });
      await repository.save('Artist 2', 'Song 2', { ...mockChordSheet, title: 'Song 2', artist: 'Artist 2' });
      await repository.cache('Artist 3', 'Song 3', { ...mockChordSheet, title: 'Song 3', artist: 'Artist 3' });
      await repository.save('Artist 4', 'Song 4', { ...mockChordSheet, title: 'Song 4', artist: 'Artist 4' });
      
      // Act: Get all saved records
      const savedRecords = await repository.getAllSaved();
      
      // Assert: Should only return the 2 saved records
      expect(savedRecords).toHaveLength(2);
      const titles = savedRecords.map(r => r.title);
      expect(titles).toContain('Song 2');
      expect(titles).toContain('Song 4');
      expect(titles).not.toContain('Song 1'); // cached but not saved
      expect(titles).not.toContain('Song 3'); // cached but not saved
    });
  });

  describe('Retention Policy (TDD)', () => {
    it('should expire cached-only songs after 7 days', async () => {
      // Arrange: Cache a song and artificially set old timestamp
      await repository.cache('Old Artist', 'Old Song', {
        ...mockChordSheet,
        title: 'Old Song',
        artist: 'Old Artist'
      });
      
      // Manually update the record to have an old timestamp (8 days ago)
      const record = await repository.getRecord('Old Artist', 'Old Song');
      if (record) {
        record.timestamp = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8 days ago
        await repository['putRecord'](record); // Using bracket notation for private method
      }
      
      // Act: Try to get the expired song
      const result = await repository.get('Old Artist', 'Old Song');
      
      // Assert: Should return null (expired and cleaned up)
      expect(result).toBeNull();
    });

    it('should expire recently deleted songs after 1 day', async () => {
      // Arrange: Save then delete a song
      await repository.save('Deleted Artist', 'Deleted Song', {
        ...mockChordSheet,
        title: 'Deleted Song', 
        artist: 'Deleted Artist'
      });
      await repository.removeFromSaved('Deleted Artist', 'Deleted Song');
      
      // Manually update deletion timestamp to 2 days ago
      const record = await repository.getRecord('Deleted Artist', 'Deleted Song');
      if (record) {
        record.deletedAt = Date.now() - (2 * 24 * 60 * 60 * 1000); // 2 days ago
        await repository['putRecord'](record);
      }
      
      // Act: Try to get the expired deleted song
      const result = await repository.get('Deleted Artist', 'Deleted Song');
      
      // Assert: Should return null (expired and cleaned up)
      expect(result).toBeNull();
    });

    it('should never expire saved songs', async () => {
      // Arrange: Save a song with very old timestamp
      await repository.save('Eternal Artist', 'Eternal Song', {
        ...mockChordSheet,
        title: 'Eternal Song',
        artist: 'Eternal Artist'
      });
      
      // Manually set timestamp to 1 year ago
      const record = await repository.getRecord('Eternal Artist', 'Eternal Song');
      if (record) {
        record.timestamp = Date.now() - (365 * 24 * 60 * 60 * 1000); // 1 year ago
        await repository['putRecord'](record);
      }
      
      // Act: Try to get the old saved song
      const result = await repository.get('Eternal Artist', 'Eternal Song');
      
      // Assert: Should still be available (never expires when saved)
      expect(result).toBeTruthy();
      expect(result?.title).toBe('Eternal Song');
    });
  });
});
