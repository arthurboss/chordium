import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetRecord, ChordSheetMetadata } from '@/cache/core/types';

/**
 * Simple key generation for testing (temporary, will be replaced by path-based keys)
 */
function generateTestKey(artist: string, title: string): string {
  return `${artist.toLowerCase()}-${title.toLowerCase()}`.replace(/\s+/g, '-');
}

/**
 * In-memory storage for testing chord sheet operations
 * Uses the same flat record structure as the main repository
 */
export class InMemoryChordSheetStorage {
  private readonly storage = new Map<string, ChordSheetRecord>();

  /**
   * Store chord sheet in memory using legacy artist/title approach
   */
  async store(
    path: string,
    artist: string,
    title: string,
    chordSheet: ChordSheet,
    metadata: Pick<ChordSheetMetadata, 'saved'>
  ): Promise<void> {
    const id = generateTestKey(artist, title);
    const now = Date.now();
    
    const record: ChordSheetRecord = {
      path,
      artist,
      title,
      chordSheet,
      saved: metadata.saved,
      timestamp: now,
      accessCount: 1,
      dataSource: 'scraping',
      version: 1,
      expiresAt: metadata.saved ? undefined : now + (24 * 60 * 60 * 1000)
    };

    this.storage.set(id, record);
  }

  /**
   * Store chord sheet by path
   */
  async storeByPath(
    path: string,
    chordSheet: ChordSheet,
    options: { saved: boolean; expiresAt?: number }
  ): Promise<void> {
    const now = Date.now();
    
    const record: ChordSheetRecord = {
      path: path,
      artist: chordSheet.artist,
      title: chordSheet.title,
      chordSheet,
      saved: options.saved,
      timestamp: now,
      accessCount: 1,
      dataSource: 'scraping',
      version: 1,
      expiresAt: options.expiresAt
    };

    this.storage.set(path, record);
  }

  /**
   * Get chord sheet from memory using legacy artist/title approach
   */
  async get(artist: string, title: string): Promise<ChordSheetRecord | null> {
    const id = generateTestKey(artist, title);
    return this.storage.get(id) ?? null;
  }

  /**
   * Get chord sheet by path
   */
  async getByPath(path: string): Promise<ChordSheetRecord | null> {
    return this.storage.get(path) ?? null;
  }

  /**
   * Delete chord sheet by path
   */
  async deleteByPath(path: string): Promise<void> {
    this.storage.delete(path);
  }

  /**
   * Get all expired cache entries
   */
  async getExpiredEntries(): Promise<ChordSheetRecord[]> {
    const now = Date.now();
    const expiredEntries: ChordSheetRecord[] = [];
    
    for (const record of this.storage.values()) {
      // Check if record is expired (and not saved - saved entries never expire)
      if (!record.saved && record.expiresAt && record.expiresAt < now) {
        expiredEntries.push(record);
      }
    }
    
    return expiredEntries;
  }

  /**
   * Remove expired cache entries
   */
  async removeExpiredEntries(): Promise<number> {
    const expiredEntries = await this.getExpiredEntries();
    
    for (const record of expiredEntries) {
      this.storage.delete(record.path);
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
   */
  async storeRecord(record: ChordSheetRecord): Promise<void> {
    this.storage.set(record.path, record);
  }
}
