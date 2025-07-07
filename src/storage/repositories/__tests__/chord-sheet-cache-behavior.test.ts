/**
 * TDD Test Suite: Chord Sheet Cache & Save Behavior
 * 
 * This test defines the expected behavior for chord sheet caching and saving:
 * - Temporary cache (saved: false) with 7-day TTL
 * - Permanent saved items (saved: true) with no expiration
 * - Flat record structure (no nested metadata)
 * - Efficient querying by saved status
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { ChordSheetRepository } from '../chord-sheet-repository';
import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetRecord } from '../../types/chord-sheet-record';

// Import fake-indexeddb components for proper cleanup
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
import FDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange';

// Type augmentation for fake-indexeddb
declare global {
  interface Window {
    indexedDB: IDBFactory;
    IDBKeyRange: typeof IDBKeyRange;
  }
}

describe('ChordSheet Cache & Save Behavior (TDD)', () => {
  let repository: ChordSheetRepository;
  let originalIndexedDB: IDBFactory | undefined;
  let originalIDBKeyRange: typeof IDBKeyRange | undefined;
  
  const mockChordSheet: ChordSheet = {
    title: 'Gravity',
    artist: 'John Mayer',
    songChords: '[Verse 1]\nG Em C D\nGravity is working against me...',
    songKey: 'G',
    guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    guitarCapo: 0
  };

  beforeAll(() => {
    // Store original values
    originalIndexedDB = globalThis.indexedDB;
    originalIDBKeyRange = globalThis.IDBKeyRange;
    
    // Set up fake IndexedDB
    globalThis.indexedDB = new FDBFactory();
    globalThis.IDBKeyRange = FDBKeyRange;
  });

  afterAll(() => {
    // Restore original values
    if (originalIndexedDB) {
      globalThis.indexedDB = originalIndexedDB;
    }
    if (originalIDBKeyRange) {
      globalThis.IDBKeyRange = originalIDBKeyRange;
    }
  });

  beforeEach(async () => {
    // Create fresh factory instance for each test
    globalThis.indexedDB = new FDBFactory();
    
    repository = new ChordSheetRepository();
    await repository.initialize();
    await repository.clear();
  });

  afterEach(async () => {
    try {
      // Close the repository connection first
      await repository.close();
      
      // Get all databases and delete them
      const fakeIndexedDB = globalThis.indexedDB as FDBFactory;
      if (fakeIndexedDB && typeof fakeIndexedDB._databases === 'object') {
        const dbNames = Object.keys(fakeIndexedDB._databases);
        for (const dbName of dbNames) {
          try {
            const deleteRequest = fakeIndexedDB.deleteDatabase(dbName);
            await new Promise<void>((resolve) => {
              deleteRequest.onsuccess = () => resolve();
              deleteRequest.onerror = () => resolve(); // Continue even if delete fails
              // Timeout after 100ms to prevent hanging
              setTimeout(() => resolve(), 100);
            });
          } catch (error) {
            // Ignore cleanup errors
            console.warn('Failed to cleanup database:', dbName, error);
          }
        }
        
        // Clear the databases map
        fakeIndexedDB._databases = {};
      }
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  });

  describe('Cache Operations (Temporary Storage)', () => {
    it('should cache a chord sheet with saved: false by default', async () => {
      // When user fetches a chord sheet, it should be cached temporarily
      await repository.cache('john-mayer', 'gravity', mockChordSheet);
      
      const record = await repository.getRecord('john-mayer', 'gravity');
      
      expect(record).toBeDefined();
      if (record) {
        expect(record.saved).toBe(false);
        expect(record.artist).toBe('John Mayer');
        expect(record.title).toBe('Gravity');
        expect(record.chordSheet).toEqual(mockChordSheet);
        expect(record.timestamp).toBeGreaterThan(Date.now() - 1000);
      }
    });

    it('should retrieve cached chord sheet within TTL period', async () => {
      await repository.cache('john-mayer', 'gravity', mockChordSheet);
      
      const retrieved = await repository.get('john-mayer', 'gravity');
      
      expect(retrieved).toEqual(mockChordSheet);
    });

    it('should return null for expired cached chord sheet after 7 days', async () => {
      // Cache a chord sheet
      await repository.cache('john-mayer', 'gravity', mockChordSheet);
      
      // Manually set timestamp to 8 days ago
      const record = await repository.getRecord('john-mayer', 'gravity');
      const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);
      await repository.updateTimestamp(record!.id, eightDaysAgo);
      
      // Should return null (expired)
      const retrieved = await repository.get('john-mayer', 'gravity');
      expect(retrieved).toBeNull();
    });

    it('should automatically clean up expired cache entries', async () => {
      // Cache multiple chord sheets
      await repository.cache('john-mayer', 'gravity', mockChordSheet);
      await repository.cache('john-mayer', 'wonderland', { ...mockChordSheet, title: 'Wonderland' });
      
      // Make one expire
      const record1 = await repository.getRecord('john-mayer', 'gravity');
      if (record1) {
        const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);
        await repository.updateTimestamp(record1.id, eightDaysAgo);
      }
      
      // Run cleanup
      await repository.clearExpiredCache();
      
      // Expired one should be gone, fresh one should remain
      expect(await repository.get('john-mayer', 'gravity')).toBeNull();
      expect(await repository.get('john-mayer', 'wonderland')).toEqual(
        expect.objectContaining({ title: 'Wonderland' })
      );
    });
  });

  describe('Save Operations (Permanent Storage)', () => {
    it('should save a chord sheet with saved: true', async () => {
      // When user clicks "Save to My Chord Sheets"
      await repository.save('john-mayer', 'gravity', mockChordSheet);
      
      const record = await repository.getRecord('john-mayer', 'gravity');
      
      expect(record).toBeDefined();
      expect(record!.saved).toBe(true);
      expect(record!.artist).toBe('John Mayer');
      expect(record!.title).toBe('Gravity');
      expect(record!.chordSheet).toEqual(mockChordSheet);
    });

    it('should retrieve saved chord sheet regardless of time', async () => {
      await repository.save('john-mayer', 'gravity', mockChordSheet);
      
      // Simulate old timestamp (should still be accessible)
      const record = await repository.getRecord('john-mayer', 'gravity');
      const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      await repository.updateTimestamp(record!.id, monthAgo);
      
      const retrieved = await repository.get('john-mayer', 'gravity');
      expect(retrieved).toEqual(mockChordSheet);
    });

    it('should not clean up saved items during cache cleanup', async () => {
      // Save a chord sheet
      await repository.save('john-mayer', 'gravity', mockChordSheet);
      
      // Make it "old"
      const record = await repository.getRecord('john-mayer', 'gravity');
      const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      await repository.updateTimestamp(record!.id, monthAgo);
      
      // Run cleanup
      await repository.clearExpiredCache();
      
      // Saved item should still exist
      expect(await repository.get('john-mayer', 'gravity')).toEqual(mockChordSheet);
    });

    it('should promote cached item to saved when user saves it', async () => {
      // First, cache the chord sheet
      await repository.cache('john-mayer', 'gravity', mockChordSheet);
      let record = await repository.getRecord('john-mayer', 'gravity');
      expect(record!.saved).toBe(false);
      
      // Then user saves it
      await repository.save('john-mayer', 'gravity', mockChordSheet);
      record = await repository.getRecord('john-mayer', 'gravity');
      expect(record!.saved).toBe(true);
      
      // Should be the same record (updated, not duplicated)
      const allRecords = await repository.getAll();
      const gravityRecords = allRecords.filter(r => 
        r.artist === 'John Mayer' && r.title === 'Gravity'
      );
      expect(gravityRecords).toHaveLength(1);
    });
  });

  describe('Query Operations', () => {
    it('should efficiently get all saved chord sheets', async () => {
      // Mix of cached and saved chord sheets
      await repository.cache('john-mayer', 'gravity', mockChordSheet);
      await repository.save('john-mayer', 'wonderland', { ...mockChordSheet, title: 'Wonderland' });
      await repository.cache('ed-sheeran', 'thinking-out-loud', { ...mockChordSheet, artist: 'Ed Sheeran', title: 'Thinking Out Loud' });
      await repository.save('taylor-swift', 'love-story', { ...mockChordSheet, artist: 'Taylor Swift', title: 'Love Story' });
      
      const savedSheets = await repository.getAllSaved();
      
      expect(savedSheets).toHaveLength(2);
      expect(savedSheets.map(s => s.title)).toEqual(
        expect.arrayContaining(['Wonderland', 'Love Story'])
      );
    });

    it('should check if specific chord sheet is saved', async () => {
      await repository.cache('john-mayer', 'gravity', mockChordSheet);
      await repository.save('john-mayer', 'wonderland', { ...mockChordSheet, title: 'Wonderland' });
      
      expect(await repository.isSaved('john-mayer', 'gravity')).toBe(false);
      expect(await repository.isSaved('john-mayer', 'wonderland')).toBe(true);
      expect(await repository.isSaved('john-mayer', 'nonexistent')).toBe(false);
    });

    it('should toggle save status', async () => {
      // Start with cached
      await repository.cache('john-mayer', 'gravity', mockChordSheet);
      expect(await repository.isSaved('john-mayer', 'gravity')).toBe(false);
      
      // Save it
      await repository.setSavedStatus('john-mayer', 'gravity', true);
      expect(await repository.isSaved('john-mayer', 'gravity')).toBe(true);
      
      // Unsave it
      await repository.setSavedStatus('john-mayer', 'gravity', false);
      expect(await repository.isSaved('john-mayer', 'gravity')).toBe(false);
    });
  });

  describe('Record Structure (Flat Schema)', () => {
    it('should store records with flat structure, not nested metadata', async () => {
      await repository.save('john-mayer', 'gravity', mockChordSheet);
      
      const record = await repository.getRecord('john-mayer', 'gravity');
      
      // Verify flat structure
      expect(record).toMatchObject({
        id: expect.any(String),
        artist: 'John Mayer',
        title: 'Gravity',
        chordSheet: mockChordSheet,
        saved: true,
        timestamp: expect.any(Number),
        accessCount: expect.any(Number)
      });
      
      // Ensure no nested metadata
      expect(record).not.toHaveProperty('metadata');
      expect(record).not.toHaveProperty('metadata.saved');
    });
  });

  describe('Configuration', () => {
    it('should use 7-day TTL for cached chord sheets', () => {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      expect(repository.getCacheTTL()).toBe(sevenDays);
    });
  });
});
