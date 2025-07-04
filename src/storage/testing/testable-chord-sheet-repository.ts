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
}
