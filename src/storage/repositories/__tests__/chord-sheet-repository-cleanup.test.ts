import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChordSheetFixtureLoader } from '../../testing/chord-sheet-fixture-loader';
import { TestableChordSheetRepository } from '../../testing/testable-chord-sheet-repository';
import { ChordSheetTestRecordFactory } from '../../testing/chord-sheet-test-record-factory';

describe('ChordSheetRepository - Expired Cache Cleanup', () => {
  let repository: TestableChordSheetRepository;

  beforeEach(async () => {
    repository = new TestableChordSheetRepository();
    await repository.initialize();
  });

  afterEach(async () => {
    await repository.clear();
    await repository.close();
  });

  it('should identify expired cache entries', async () => {
    const chordSheet = ChordSheetFixtureLoader.loadChordSheet('oasis-wonderwall');
    
    // Store an expired record
    const expiredRecord = ChordSheetTestRecordFactory.createExpiredRecord(
      'Oasis',
      'Wonderwall',
      chordSheet
    );
    await repository.storeRecord(expiredRecord);
    
    // Store a fresh record
    const freshRecord = ChordSheetTestRecordFactory.createFreshRecord(
      'Eagles',
      'Hotel California',
      ChordSheetFixtureLoader.loadChordSheet('eagles-hotel_california')
    );
    await repository.storeRecord(freshRecord);
    
    // Get expired entries
    const expiredEntries = await repository.getExpiredEntries();
    
    // Should find the expired entry
    expect(expiredEntries).toHaveLength(1);
    expect(expiredEntries[0].id).toBe(expiredRecord.id);
  });

  it('should not identify saved chord sheets as expired', async () => {
    const chordSheet = ChordSheetFixtureLoader.loadChordSheet('eagles-hotel_california');
    
    // Store a saved record (never expires)
    const savedRecord = ChordSheetTestRecordFactory.createSavedRecord(
      'Eagles',
      'Hotel California',
      chordSheet
    );
    await repository.storeRecord(savedRecord);
    
    const expiredEntries = await repository.getExpiredEntries();
    
    // Saved chord sheets should never be considered expired
    expect(expiredEntries).toHaveLength(0);
  });

  it('should remove expired cache entries', async () => {
    const chordSheet1 = ChordSheetFixtureLoader.loadChordSheet('oasis-wonderwall');
    const chordSheet2 = ChordSheetFixtureLoader.loadChordSheet('eagles-hotel_california');
    
    // Store one expired and one fresh record
    const expiredRecord = ChordSheetTestRecordFactory.createExpiredRecord(
      'Oasis',
      'Wonderwall',
      chordSheet1
    );
    await repository.storeRecord(expiredRecord);
    
    const freshRecord = ChordSheetTestRecordFactory.createFreshRecord(
      'Eagles',
      'Hotel California',
      chordSheet2
    );
    await repository.storeRecord(freshRecord);
    
    const initialCount = (await repository.getAll()).length;
    expect(initialCount).toBe(2);
    
    // Remove expired entries
    const removedCount = await repository.removeExpiredEntries();
    
    // Should have removed 1 expired entry
    expect(removedCount).toBe(1);
    
    // Should have 1 record remaining
    const finalCount = (await repository.getAll()).length;
    expect(finalCount).toBe(1);
    
    // Verify the remaining record is the fresh one
    const remainingRecords = await repository.getAll();
    expect(remainingRecords[0].id).toBe(freshRecord.id);
  });

  it('should handle empty cache when cleaning expired entries', async () => {
    const expiredEntries = await repository.getExpiredEntries();
    expect(expiredEntries).toHaveLength(0);
    
    const removedCount = await repository.removeExpiredEntries();
    expect(removedCount).toBe(0);
  });
});
