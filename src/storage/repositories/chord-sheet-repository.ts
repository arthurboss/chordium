import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetRecord, ChordSheetMetadata } from '../types/chord-sheet-record';
import { ChordSheetDBConnection } from '../../cache/storage/indexeddb/connection';
import { isChordSheetExpired } from '../../cache/storage/policies/retention-policy';
import { CHORD_SHEET_DB_SCHEMA } from '../schema/chord-sheet-db-schema';

/**
 * Internal type for IndexedDB storage - uses number saved field for IndexedDB compatibility
 */
interface ChordSheetRecordDB extends Omit<ChordSheetRecord, 'saved'> {
  saved: 0 | 1; // Number values for reliable IndexedDB filtering
}

/**
 * Repository for chord sheet storage operations
 * Handles both cached (temporary) and saved (permanent) chord sheets
 * Features:
 * - Temporary cache (saved: false) with 7-day TTL
 * - Permanent saved items (saved: true) with no expiration
 * - Path-based operations only (uses Song.path from API response)
 * - Retention policy enforcement
 * - Access count tracking for LRU eviction
 */
export class ChordSheetRepository {
  private readonly connection = new ChordSheetDBConnection();
  private static readonly CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Initialize the database connection
   */
  async initialize(): Promise<void> {
    await this.connection.initialize();
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    await this.connection.close();
  }

  /**
   * Convert boolean saved field to number for IndexedDB storage
   */
  private recordToDB(record: ChordSheetRecord): ChordSheetRecordDB {
    return {
      ...record,
      saved: record.saved ? 1 : 0
    };
  }

  /**
   * Convert number saved field back to boolean from IndexedDB storage
   */
  private recordFromDB(dbRecord: ChordSheetRecordDB): ChordSheetRecord {
    return {
      ...dbRecord,
      saved: dbRecord.saved === 1
    };
  }

  /**
   * Get cache TTL (for testing)
   */
  getCacheTTL(): number {
    return ChordSheetRepository.CACHE_TTL;
  }

  /**
   * Get all saved chord sheets (My Chord Sheets)
   */
  async getAllSaved(): Promise<ChordSheet[]> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readonly');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    return new Promise((resolve, reject) => {
      // Use the saved index to filter for saved records (saved = 1)
      const savedIndex = store.index('saved');
      const request = savedIndex.getAll(1);
      
      request.onsuccess = () => {
        const dbRecords = request.result as ChordSheetRecordDB[];
        // Convert number saved field back to boolean and extract chord sheets
        const chordSheets = dbRecords.map(dbRecord => {
          const record = this.recordFromDB(dbRecord);
          return record.chordSheet;
        });
        resolve(chordSheets);
      };
      request.onerror = () => reject(request.error);
    });
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
      request.onsuccess = () => {
        const dbRecords = request.result as ChordSheetRecordDB[];
        // Convert number saved field back to boolean for all records
        const records = dbRecords.map(dbRecord => this.recordFromDB(dbRecord));
        resolve(records);
      };
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
        const dbRecord = getRequest.result as ChordSheetRecordDB;
        if (dbRecord) {
          // Convert from DB format, update timestamp, and convert back
          const record = this.recordFromDB(dbRecord);
          const updatedRecord: ChordSheetRecord = { ...record, timestamp };
          
          const putRequest = store.put(this.recordToDB(updatedRecord));
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
        const dbRecord = getRequest.result as ChordSheetRecordDB;
        if (dbRecord) {
          // Convert from DB format, update access count, and convert back
          const record = this.recordFromDB(dbRecord);
          const updatedRecord: ChordSheetRecord = { ...record, accessCount };
          
          const putRequest = store.put(this.recordToDB(updatedRecord));
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
   * Put record to store
   */
  private async putRecord(record: ChordSheetRecord): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    return new Promise((resolve, reject) => {
      // Convert boolean saved field to number for IndexedDB compatibility
      const dbRecord = this.recordToDB(record);
      const request = store.put(dbRecord);
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

  /**
   * Clean up expired chord sheet records
   * Should be called periodically to maintain cache hygiene
   */
  async cleanupExpiredRecords(): Promise<number> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    return new Promise((resolve, reject) => {
      let deletedCount = 0;
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        
        if (cursor) {
          const record = cursor.value as ChordSheetRecord;
          
          if (isChordSheetExpired(record)) {
            cursor.delete();
            deletedCount++;
          }
          
          cursor.continue();
        } else {
          // Finished iterating
          resolve(deletedCount);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Store a chord sheet using path as key
   */
  async storeByPath(path: string, chordSheet: ChordSheet, options: { saved: boolean; expiresAt?: number; dataSource?: 'scraping' | 's3' | 'sample' | 'local' }): Promise<void> {

    // Check if record already exists to preserve access count and version
    const existingRecord = await this.getRecordByPath(path);
    
    const record: ChordSheetRecord = {
      path,
      artist: chordSheet.artist,
      title: chordSheet.title,
      chordSheet,
      saved: options.saved,
      timestamp: Date.now(),
      accessCount: existingRecord?.accessCount ?? 0,
      dataSource: options.dataSource ?? 'scraping',
      version: existingRecord?.version ?? 1,
      expiresAt: options.expiresAt
    };

    await this.putRecord(record);
  }

  /**
   * Get a chord sheet by path
   */
  async getByPath(path: string): Promise<{ chordSheet: ChordSheet; metadata: ChordSheetMetadata } | null> {
    const record = await this.getRecordByPath(path);
    
    if (!record) {
      return null;
    }

    // Check expiration for cached items
    if (!record.saved && this.isExpired(record)) {
      await this.deleteByPath(path);
      return null;
    }

    // Update access count
    await this.updateAccessCountByPath(path, record.accessCount + 1);

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
   * Get raw record by path (for testing and internal use)
   */
  async getRecordByPath(path: string): Promise<ChordSheetRecord | null> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readonly');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);
    
    return new Promise((resolve, reject) => {
      const request = store.get(path);
      request.onsuccess = () => {
        const dbRecord = request.result;
        if (dbRecord) {
          const record = this.recordFromDB(dbRecord);
          resolve(record);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a chord sheet by path
   */
  async deleteByPath(path: string): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    return new Promise((resolve, reject) => {
      const request = store.delete(path);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check if a chord sheet is saved by path
   */
  async isSavedByPath(path: string): Promise<boolean> {
    const record = await this.getRecordByPath(path);
    return record?.saved ?? false;
  }

  /**
   * Toggle save status of a chord sheet by path
   */
  async toggleSaveByPath(path: string): Promise<void> {
    const record = await this.getRecordByPath(path);
    if (!record) {
      throw new Error(`Chord sheet not found at path: ${path}`);
    }

    const updatedRecord: ChordSheetRecord = {
      ...record,
      saved: !record.saved,
      timestamp: Date.now()
    };

    await this.putRecord(updatedRecord);
  }

  /**
   * Update access count by path
   */
  private async updateAccessCountByPath(path: string, accessCount: number): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    return new Promise((resolve, reject) => {
      const getRequest = store.get(path);
      
      getRequest.onsuccess = () => {
        const dbRecord = getRequest.result;
        if (dbRecord) {
          dbRecord.accessCount = accessCount;
          const putRequest = store.put(dbRecord);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve(); // Record doesn't exist, nothing to update
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }
}
