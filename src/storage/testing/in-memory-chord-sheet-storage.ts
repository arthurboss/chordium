import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetRecord, ChordSheetMetadata } from '../types/chord-sheet-record';
import { generateChordSheetCacheKey } from '../utils/generate-chord-sheet-cache-key';

/**
 * In-memory storage for testing chord sheet operations
 * Follows SRP: Single responsibility for test storage simulation
 */
export class InMemoryChordSheetStorage {
  private readonly storage = new Map<string, ChordSheetRecord>();

  /**
   * Store chord sheet in memory
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
    const id = generateChordSheetCacheKey(artist, title);
    const now = Date.now();
    
    const record: ChordSheetRecord = {
      id,
      artist,
      title,
      chordSheet,
      metadata: {
        saved: metadata.saved,
        lastAccessed: now,
        accessCount: 1
      },
      cacheInfo: {
        cachedAt: now,
        expiresAt: metadata.saved ? Number.MAX_SAFE_INTEGER : now + (24 * 60 * 60 * 1000),
        version: '1.0'
      }
    };

    this.storage.set(id, record);
  }

  /**
   * Get chord sheet from memory
   * @param artist - Artist name
   * @param title - Song title
   * @returns Chord sheet record or null if not found
   */
  async get(artist: string, title: string): Promise<ChordSheetRecord | null> {
    const id = generateChordSheetCacheKey(artist, title);
    return this.storage.get(id) ?? null;
  }

  /**
   * Get all expired cache entries
   * @returns Array of expired chord sheet records
   */
  async getExpiredEntries(): Promise<ChordSheetRecord[]> {
    const now = Date.now();
    const expiredEntries: ChordSheetRecord[] = [];
    
    for (const record of this.storage.values()) {
      // Check if record is expired (and not saved - saved entries never expire)
      if (!record.metadata.saved && record.cacheInfo.expiresAt < now) {
        expiredEntries.push(record);
      }
    }
    
    return expiredEntries;
  }

  /**
   * Remove expired cache entries
   * @returns Number of entries removed
   */
  async removeExpiredEntries(): Promise<number> {
    const expiredEntries = await this.getExpiredEntries();
    
    for (const record of expiredEntries) {
      this.storage.delete(record.id);
    }
    
    return expiredEntries.length;
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  async getAllValues(): Promise<ChordSheetRecord[]> {
    return Array.from(this.storage.values());
  }

  /**
   * Store a pre-built record directly (for testing)
   * @param record - Pre-built chord sheet record
   */
  async storeRecord(record: ChordSheetRecord): Promise<void> {
    this.storage.set(record.id, record);
  }
}
