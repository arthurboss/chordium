import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetRecord, ChordSheetMetadata } from '../types/chord-sheet-record';
import { InMemoryChordSheetStorage } from './in-memory-chord-sheet-storage';

/**
 * Testable chord sheet repository using in-memory storage
 * Follows SRP: Single responsibility for test data operations
 */
export class TestableChordSheetRepository {
  private readonly storage: InMemoryChordSheetStorage;

  constructor() {
    this.storage = new InMemoryChordSheetStorage();
  }

  /**
   * Initialize storage (no-op for in-memory)
   */
  async initialize(): Promise<void> {
    // No initialization needed for in-memory storage
  }

  /**
   * Close storage (no-op for in-memory)
   */
  async close(): Promise<void> {
    // No cleanup needed for in-memory storage
  }

  /**
   * Store chord sheet
   * @param artist - Artist name
   * @param title - Song title
   * @param chordSheet - Chord sheet data
   * @param metadata - Storage metadata
   */
  async store(
    artist: string,
    title: string,
    chordSheet: ChordSheet,
    metadata: Pick<ChordSheetMetadata, 'saved'>
  ): Promise<void> {
    await this.storage.store(artist, title, chordSheet, metadata);
  }

  /**
   * Get chord sheet
   * @param artist - Artist name
   * @param title - Song title
   * @returns Chord sheet record or null if not found
   */
  async get(artist: string, title: string): Promise<ChordSheetRecord | null> {
    return await this.storage.get(artist, title);
  }

  /**
   * Get all expired cache entries
   * @returns Array of expired chord sheet records
   */
  async getExpiredEntries(): Promise<ChordSheetRecord[]> {
    return await this.storage.getExpiredEntries();
  }

  /**
   * Remove expired cache entries
   * @returns Number of entries removed
   */
  async removeExpiredEntries(): Promise<number> {
    return await this.storage.removeExpiredEntries();
  }

  /**
   * Clear all stored data
   */
  async clear(): Promise<void> {
    await this.storage.clear();
  }

  /**
   * Get all stored records
   */
  async getAll(): Promise<ChordSheetRecord[]> {
    return await this.storage.getAllValues();
  }

  /**
   * Store a pre-built record directly (for testing)
   * @param record - Pre-built chord sheet record
   */
  async storeRecord(record: ChordSheetRecord): Promise<void> {
    await this.storage.storeRecord(record);
  }

  /**
   * Store a chord sheet using path as key
   */
  async storeByPath(path: string, chordSheet: ChordSheet, options: { saved: boolean; expiresAt?: number }): Promise<void> {
    await this.storage.storeByPath(path, chordSheet, options);
  }

  /**
   * Get a chord sheet by path
   */
  async getByPath(path: string): Promise<{ chordSheet: ChordSheet; metadata: ChordSheetMetadata } | null> {
    const record = await this.storage.getByPath(path);
    
    if (!record) {
      return null;
    }

    // Check expiration for cached items
    if (!record.saved && record.expiresAt && Date.now() > record.expiresAt) {
      await this.deleteByPath(path);
      return null;
    }

    return {
      chordSheet: record.chordSheet,
      metadata: {
        saved: record.saved,
        timestamp: record.timestamp,
        accessCount: record.accessCount,
        dataSource: record.dataSource,
        version: record.version,
        deletedAt: record.deletedAt,
        expiresAt: record.expiresAt
      }
    };
  }

  /**
   * Delete a chord sheet by path
   */
  async deleteByPath(path: string): Promise<void> {
    await this.storage.deleteByPath(path);
  }

  /**
   * Check if a chord sheet is saved by path
   */
  async isSavedByPath(path: string): Promise<boolean> {
    const record = await this.storage.getByPath(path);
    return record?.saved ?? false;
  }

  /**
   * Toggle save status of a chord sheet by path
   */
  async toggleSaveByPath(path: string): Promise<void> {
    const record = await this.storage.getByPath(path);
    if (!record) {
      throw new Error(`Chord sheet not found at path: ${path}`);
    }

    const updatedRecord: ChordSheetRecord = {
      ...record,
      saved: !record.saved,
      timestamp: Date.now()
    };

    await this.storage.storeRecord(updatedRecord);
  }
}
