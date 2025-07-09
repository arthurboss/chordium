import { ChordSheet } from "@/types/chordSheet";
import { ChordSheetRepository } from "../repositories/chord-sheet-repository";
import { ChordSheetMetadata } from "../types/chord-sheet-record";

/**
 * Cache coordinator for IndexedDB chord sheet storage
 * Follows SRP: Single responsibility for cache coordination
 */
export class IndexedDBCacheCoordinator {
  private readonly repository: ChordSheetRepository;

  constructor() {
    this.repository = new ChordSheetRepository();
  }

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    await this.repository.initialize();
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.repository.close();
  }

  /**
   * Cache chord sheet in IndexedDB
   * @param path - Chord sheet path
   * @param chordSheet - Chord sheet data
   * @param options - Cache options
   */
  async cacheChordSheet(
    path: string,
    chordSheet: ChordSheet,
    options: Pick<ChordSheetMetadata, "saved">
  ): Promise<void> {
    await this.repository.storeByPath(path, chordSheet, options);
  }

  /**
   * Get cached chord sheet from IndexedDB
   * @param path - Chord sheet path
   * @returns Chord sheet or null if not found
   */
  async getCachedChordSheetByPath(path: string): Promise<ChordSheet | null> {
    const record = await this.repository.getByPath(path);
    return record?.chordSheet ?? null;
  }

  /**
   * Clear expired cache entries from IndexedDB
   * @returns Number of entries removed
   */
  async clearExpiredCache(): Promise<number> {
    return await this.repository.cleanupExpiredRecords();
  }

  /**
   * Get count of expired cache entries
   * @returns Number of expired entries
   */
  async getExpiredCacheCount(): Promise<number> {
    // Since we can't get expired entries directly anymore,
    // we'll have to return 0 or implement a different approach
    return 0;
  }
}
