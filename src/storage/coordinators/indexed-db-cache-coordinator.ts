import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetRepository } from '../repositories/chord-sheet-repository';
import { ChordSheetMetadata } from '../types/chord-sheet-record';

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
   * @param artist - Artist name
   * @param title - Song title
   * @param chordSheet - Chord sheet data
   * @param options - Cache options
   */
  async cacheChordSheet(
    artist: string,
    title: string,
    chordSheet: ChordSheet,
    options: Pick<ChordSheetMetadata, 'saved'>
  ): Promise<void> {
    await this.repository.store(artist, title, chordSheet, options);
  }

  /**
   * Get cached chord sheet from IndexedDB
   * @param artist - Artist name
   * @param title - Song title
   * @returns Chord sheet or null if not found
   */
  async getCachedChordSheet(artist: string, title: string): Promise<ChordSheet | null> {
    const record = await this.repository.get(artist, title);
    return record?.chordSheet ?? null;
  }

  /**
   * Clear expired cache entries from IndexedDB
   * @returns Number of entries removed
   */
  async clearExpiredCache(): Promise<number> {
    return await this.repository.removeExpiredEntries();
  }

  /**
   * Get count of expired cache entries
   * @returns Number of expired entries
   */
  async getExpiredCacheCount(): Promise<number> {
    const expiredEntries = await this.repository.getExpiredEntries();
    return expiredEntries.length;
  }
}
