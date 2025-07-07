import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetDBConnection } from '../connection/chord-sheet-db-connection';
import { ChordSheetRecord } from '../types/chord-sheet-record';
import { generateChordSheetCacheKey } from '../utils/generate-chord-sheet-cache-key';
import { CHORD_SHEET_DB_SCHEMA } from '../schema/chord-sheet-db-schema';

/**
 * Repository for chord sheet storage operations with cache & save functionality
 * Follows SRP: Single responsibility for data persistence
 * 
 * Features:
 * - Temporary cache (saved: false) with 7-day TTL
 * - Permanent saved items (saved: true) with no expiration
 * - Flat record structure for efficient IndexedDB querying
 */
export class ChordSheetRepository {
  private readonly connection: ChordSheetDBConnection;
  private static readonly CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

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
   * Get cache TTL (for testing)
   */
  getCacheTTL(): number {
    return ChordSheetRepository.CACHE_TTL;
  }

  /**
   * Cache a chord sheet temporarily (saved: false)
   * Used when user fetches a chord sheet for viewing
   */
  async cache(artist: string, title: string, chordSheet: ChordSheet): Promise<void> {
    await this.storeRecord(artist, title, chordSheet, false);
  }

  /**
   * Save a chord sheet permanently (saved: true)
   * Used when user adds to "My Chord Sheets"
   */
  async save(artist: string, title: string, chordSheet: ChordSheet): Promise<void> {
    await this.storeRecord(artist, title, chordSheet, true);
  }

  /**
   * Get a chord sheet (cache or saved), respecting TTL for cached items
   */
  async get(artist: string, title: string): Promise<ChordSheet | null> {
    const record = await this.getRecord(artist, title);
    if (!record) return null;

    // If it's cached (not saved), check expiration
    if (!record.saved && this.isExpired(record)) {
      await this.delete(record.id);
      return null;
    }

    // Update access count
    await this.updateAccessCount(record.id, record.accessCount + 1);

    return record.chordSheet;
  }

  /**
   * Get raw record (for testing and internal use)
   */
  async getRecord(artist: string, title: string): Promise<ChordSheetRecord | null> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readonly');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    const id = generateChordSheetCacheKey(artist, title);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all saved chord sheets (My Chord Sheets)
   */
  async getAllSaved(): Promise<ChordSheet[]> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readonly');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);
    const savedIndex = store.index('saved');

    return new Promise((resolve, reject) => {
      const request = savedIndex.getAll(IDBKeyRange.only(true)); // saved = true
      request.onsuccess = () => {
        const records = request.result as ChordSheetRecord[];
        resolve(records.map(record => record.chordSheet));
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check if a chord sheet is saved
   */
  async isSaved(artist: string, title: string): Promise<boolean> {
    const record = await this.getRecord(artist, title);
    return record?.saved ?? false;
  }

  /**
   * Set save status of a chord sheet
   */
  async setSavedStatus(artist: string, title: string, saved: boolean): Promise<void> {
    const record = await this.getRecord(artist, title);
    if (!record) {
      throw new Error(`Chord sheet not found: ${artist} - ${title}`);
    }

    const updatedRecord: ChordSheetRecord = {
      ...record,
      saved,
      timestamp: Date.now() // Update timestamp when saving
    };

    await this.putRecord(updatedRecord);
  }

  /**
   * Clear expired cache items (but keep saved ones)
   */
  async clearExpiredCache(): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    return new Promise((resolve, reject) => {
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const record = cursor.value as ChordSheetRecord;
          
          // Only delete expired cache items (not saved items)
          if (!record.saved && this.isExpired(record)) {
            cursor.delete();
          }
          
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all records
   */
  async getAll(): Promise<ChordSheetRecord[]> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readonly');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as ChordSheetRecord[]);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all records
   */
  async clear(): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a specific record
   */
  async delete(id: string): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update timestamp (for testing)
   */
  async updateTimestamp(id: string, timestamp: number): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const record = getRequest.result as ChordSheetRecord;
        if (record) {
          const updatedRecord: ChordSheetRecord = { ...record, timestamp };
          
          const putRequest = store.put(updatedRecord);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error(`Record not found: ${id}`));
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Update access count
   */
  private async updateAccessCount(id: string, accessCount: number): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const record = getRequest.result as ChordSheetRecord;
        if (record) {
          const updatedRecord: ChordSheetRecord = { ...record, accessCount };
          
          const putRequest = store.put(updatedRecord);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(); // Record might have been deleted
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Store record with flat structure
   */
  private async storeRecord(artist: string, title: string, chordSheet: ChordSheet, saved: boolean): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    const id = generateChordSheetCacheKey(artist, title);
    
    // Check if record already exists to preserve access count
    const existingRecord = await this.getRecord(artist, title);
    
    const record: ChordSheetRecord = {
      id,
      artist,
      title,
      chordSheet,
      saved,
      timestamp: Date.now(),
      accessCount: existingRecord?.accessCount ?? 0
    };

    await this.putRecord(record);
  }

  /**
   * Put record to store
   */
  private async putRecord(record: ChordSheetRecord): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    return new Promise((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check if a record is expired (only applies to cached items, not saved)
   */
  private isExpired(record: ChordSheetRecord): boolean {
    if (record.saved) return false; // Saved items never expire
    return Date.now() - record.timestamp > ChordSheetRepository.CACHE_TTL;
  }
}
