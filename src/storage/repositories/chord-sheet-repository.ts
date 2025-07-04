import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetDBConnection } from '../connection/chord-sheet-db-connection';
import { ChordSheetRecord, ChordSheetMetadata } from '../types/chord-sheet-record';
import { generateChordSheetCacheKey } from '../utils/generate-chord-sheet-cache-key';
import { CHORD_SHEET_DB_SCHEMA } from '../schema/chord-sheet-db-schema';

/**
 * Repository for chord sheet storage operations
 * Follows SRP: Single responsibility for data persistence
 */
export class ChordSheetRepository {
  private readonly connection: ChordSheetDBConnection;

  constructor() {
    this.connection = new ChordSheetDBConnection();
  }

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    await this.connection.initialize();
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.connection.close();
  }

  /**
   * Store chord sheet in database
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
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    const now = Date.now();
    const id = generateChordSheetCacheKey(artist, title);
    
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

    return new Promise((resolve, reject) => {
      const request = store.put(record);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get chord sheet from database
   * @param artist - Artist name
   * @param title - Song title
   * @returns Chord sheet record or null if not found
   */
  async get(artist: string, title: string): Promise<ChordSheetRecord | null> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readonly');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    const id = generateChordSheetCacheKey(artist, title);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result ?? null);
    });
  }

  /**
   * Get all expired cache entries
   * @returns Array of expired chord sheet records
   */
  async getExpiredEntries(): Promise<ChordSheetRecord[]> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readonly');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    const now = Date.now();
    const expiredEntries: ChordSheetRecord[] = [];

    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        
        if (cursor) {
          const record = cursor.value as ChordSheetRecord;
          
          // Check if record is expired (and not saved - saved entries never expire)
          if (!record.metadata.saved && record.cacheInfo.expiresAt < now) {
            expiredEntries.push(record);
          }
          
          cursor.continue();
        } else {
          resolve(expiredEntries);
        }
      };
    });
  }

  /**
   * Remove expired cache entries
   * @returns Number of entries removed
   */
  async removeExpiredEntries(): Promise<number> {
    const expiredEntries = await this.getExpiredEntries();
    
    if (expiredEntries.length === 0) {
      return 0;
    }

    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    return new Promise((resolve, reject) => {
      let removedCount = 0;
      let processedCount = 0;

      const onComplete = () => {
        if (processedCount === expiredEntries.length) {
          resolve(removedCount);
        }
      };

      expiredEntries.forEach(record => {
        const request = store.delete(record.id);
        
        request.onerror = () => {
          processedCount++;
          onComplete();
        };
        
        request.onsuccess = () => {
          removedCount++;
          processedCount++;
          onComplete();
        };
      });
    });
  }

  /**
   * Clear all cache entries (for testing purposes)
   */
  async clear(): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get all saved chord sheets
   * @returns Array of saved ChordSheet objects
   */
  async getAllSaved(): Promise<ChordSheet[]> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readonly');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    const savedChordSheets: ChordSheet[] = [];

    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        
        if (cursor) {
          const record = cursor.value as ChordSheetRecord;
          
          // Only include saved entries
          if (record.metadata.saved) {
            savedChordSheets.push(record.chordSheet);
          }
          
          cursor.continue();
        } else {
          resolve(savedChordSheets);
        }
      };
    });
  }

  /**
   * Delete chord sheet from database
   * @param artist - Artist name
   * @param title - Song title
   */
  async delete(artist: string, title: string): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    const id = generateChordSheetCacheKey(artist, title);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      
      request.onerror = () => {
        reject(new Error(`Failed to delete chord sheet for ${artist} - ${title}`));
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  }
}
