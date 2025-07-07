import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ChordSheetFixtureLoader } from '../../testing/chord-sheet-fixture-loader';
import { TestableChordSheetRepository } from '../../testing/testable-chord-sheet-repository';
import { ChordSheetTestRecordFactory } from '../../testing/chord-sheet-test-record-factory';

// Create a testable version of the coordinator
class TestableIndexedDBCacheCoordinator {
  readonly repository: TestableChordSheetRepository;

  constructor() {
    this.repository = new TestableChordSheetRepository();
  }

  async initialize(): Promise<void> {
    await this.repository.initialize();
  }

  async close(): Promise<void> {
    await this.repository.close();
  }

  async clearExpiredCache(): Promise<number> {
    return await this.repository.removeExpiredEntries();
  }

  async getExpiredCacheCount(): Promise<number> {
    const expiredEntries = await this.repository.getExpiredEntries();
    return expiredEntries.length;
  }

  async getCachedChordSheet(artist: string, title: string) {
    const record = await this.repository.get(artist, title);
    return record?.chordSheet ?? null;
  }
}

describe('IndexedDBCacheCoordinator - Cleanup', () => {
  let coordinator: TestableIndexedDBCacheCoordinator;

  beforeEach(async () => {
    coordinator = new TestableIndexedDBCacheCoordinator();
    await coordinator.initialize();
  });

  afterEach(async () => {
    await coordinator.close();
  });

  it('should clear expired cache entries', async () => {
    const chordSheet1 = ChordSheetFixtureLoader.loadChordSheet('oasis-wonderwall');
    const chordSheet2 = ChordSheetFixtureLoader.loadChordSheet('eagles-hotel_california');
    
    // Store one expired and one fresh record
    const expiredRecord = ChordSheetTestRecordFactory.createExpiredRecord(
      'Oasis',
      'Wonderwall',
      chordSheet1
    );
    await coordinator.repository.storeRecord(expiredRecord);
    
    const freshRecord = ChordSheetTestRecordFactory.createFreshRecord(
      'Eagles',
      'Hotel California',
      chordSheet2
    );
    await coordinator.repository.storeRecord(freshRecord);
    
    // Clear expired cache
    const removedCount = await coordinator.clearExpiredCache();
    
    // Should have removed 1 expired entry
    expect(removedCount).toBe(1);
    
    // Verify the fresh record is still there
    const cachedChordSheet = await coordinator.getCachedChordSheet('Eagles', 'Hotel California');
    expect(cachedChordSheet).toBeTruthy();
    expect(cachedChordSheet?.title).toBe('Hotel California');
    
    // Verify the expired record is gone
    const expiredChordSheet = await coordinator.getCachedChordSheet('Oasis', 'Wonderwall');
    expect(expiredChordSheet).toBeNull();
  });

  it('should get count of expired cache entries', async () => {
    const chordSheet1 = ChordSheetFixtureLoader.loadChordSheet('oasis-wonderwall');
    const chordSheet2 = ChordSheetFixtureLoader.loadChordSheet('eagles-hotel_california');
    
    // Store two expired records
    const expiredRecord1 = ChordSheetTestRecordFactory.createExpiredRecord(
      'Oasis',
      'Wonderwall',
      chordSheet1
    );
    await coordinator.repository.storeRecord(expiredRecord1);
    
    const expiredRecord2 = ChordSheetTestRecordFactory.createExpiredRecord(
      'Eagles',
      'Hotel California',
      chordSheet2
    );
    await coordinator.repository.storeRecord(expiredRecord2);
    
    const expiredCount = await coordinator.getExpiredCacheCount();
    
    // Should have 2 expired entries
    expect(expiredCount).toBe(2);
  });

  it('should handle empty cache when checking expired count', async () => {
    const expiredCount = await coordinator.getExpiredCacheCount();
    expect(expiredCount).toBe(0);
  });
});
