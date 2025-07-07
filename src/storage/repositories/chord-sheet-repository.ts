import { ChordSheet } from '@/types/chordSheet';
import { ChordSheetRecord } from '../types/chord-sheet-record';
import { ChordSheetDBConnection } from '../connection/chord-sheet-db-connection';
import { generateChordSheetCacheKey } from '../utils/generate-chord-sheet-cache-key';
import { isChordSheetExpired } from '../utils/chord-sheet-retention-policy';
import { CHORD_SHEET_DB_SCHEMA } from '../schema/chord-sheet-db-schema';
import { removeDiacritics } from '../utils/unicode-normalizer';

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
 * - Automatic cache key generation and normalization
 * - Retention policy enforcement
 * - Access count tracking for LRU eviction
 */
export class ChordSheetRepository {
  private connection = new ChordSheetDBConnection();
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
   * Cache a chord sheet temporarily (saved: false)
   * Used when user fetches a chord sheet for viewing
   */
  async cache(artist: string, title: string, chordSheet: ChordSheet): Promise<void> {
    await this.storeRecord(artist, title, chordSheet, false);
  }

  /**
   * Save a chord sheet permanently (saved: true)
   * Used when user adds to "My Chord Sheets"
   * Updates existing cached record instead of creating duplicate
   */
  async save(artist: string, title: string, chordSheet: ChordSheet): Promise<void> {
    // First try to find and update existing cached record
    const existingRecord = await this.getRecord(artist, title);
    
    if (existingRecord) {
      // Update existing record to mark as saved
      existingRecord.saved = true;
      existingRecord.timestamp = Date.now(); // Update timestamp when saved
      existingRecord.chordSheet = chordSheet; // Update with latest chord sheet data
      existingRecord.deletedAt = undefined; // Clear deletion timestamp when re-saved
      await this.putRecord(existingRecord);
    } else {
      // Fallback: create new record if none exists
      await this.storeRecord(artist, title, chordSheet, true);
    }
  }

  /**
   * Get a chord sheet (cache or saved), respecting retention policy
   */
  async get(artist: string, title: string): Promise<ChordSheet | null> {
    const record = await this.getRecord(artist, title);
    if (!record) return null;

    // Check if record has expired based on retention policy
    if (isChordSheetExpired(record)) {
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
      request.onsuccess = () => {
        const dbRecord = request.result;
        if (dbRecord) {
          // Convert number saved field back to boolean
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
   * Store record with flat structure
   */
  private async storeRecord(artist: string, title: string, chordSheet: ChordSheet, saved: boolean): Promise<void> {
    const db = await this.connection.initialize();
    const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
    const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

    const id = generateChordSheetCacheKey(artist, title);
    
    // Check if record already exists to preserve access count and version
    const existingRecord = await this.getRecord(artist, title);
    
    const record: ChordSheetRecord = {
      id,
      artist: chordSheet.artist, // Use display values from ChordSheet object
      title: chordSheet.title,   // Use display values from ChordSheet object
      chordSheet,
      saved,
      timestamp: Date.now(),
      accessCount: existingRecord?.accessCount ?? 0,
      // Future-ready fields (optional for backward compatibility)
      dataSource: 'scraping', // Default to scraping for now
      version: existingRecord?.version ?? 1
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
   * Clean up duplicate cached records for the same song when saving
   * This removes any cached (saved: false) records that might be duplicates
   * of the song being saved (saved: true)
   */
  private async cleanupDuplicateCachedRecords(artist: string, title: string): Promise<void> {
    try {
      const db = await this.connection.initialize();
      const transaction = db.transaction([CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name], 'readwrite');
      const store = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);

      // Get all records to check for duplicates
      const getAllRequest = store.getAll();
      
      return new Promise((resolve, reject) => {
        getAllRequest.onsuccess = () => {
          const dbRecords = getAllRequest.result as ChordSheetRecordDB[];
          // Convert number saved field back to boolean for filtering
          const records = dbRecords.map(dbRecord => this.recordFromDB(dbRecord));
          
          // Find cached records that might be duplicates (same artist and title content)
          const currentSavedId = generateChordSheetCacheKey(artist, title);
          const duplicateIds: string[] = [];
          
          records.forEach(record => {
            // Skip if it's the current saved record or already saved
            if (record.id === currentSavedId || record.saved) return;
            
            // Check if this cached record is for the same song (fuzzy match)
            const isSameArtist = this.fuzzyMatch(record.artist, artist);
            const isSameTitle = this.fuzzyMatch(record.title, title);
            
            if (isSameArtist && isSameTitle) {
              duplicateIds.push(record.id);
            }
          });
          
          // Delete duplicate cached records
          let deletedCount = 0;
          duplicateIds.forEach(id => {
            const deleteRequest = store.delete(id);
            deleteRequest.onsuccess = () => {
              deletedCount++;
              if (deletedCount === duplicateIds.length) {
                if (duplicateIds.length > 0) {
                  console.log(`🧹 Cleaned up ${duplicateIds.length} duplicate cached records for "${title}" by "${artist}"`);
                }
                resolve();
              }
            };
            deleteRequest.onerror = () => reject(deleteRequest.error);
          });
          
          // If no duplicates to delete, resolve immediately
          if (duplicateIds.length === 0) {
            resolve();
          }
        };
        
        getAllRequest.onerror = () => reject(getAllRequest.error);
      });
    } catch (error) {
      console.warn('Failed to cleanup duplicate cached records:', error);
      // Don't throw - this is cleanup, not critical
    }
  }

  /**
   * Fuzzy match two strings (case-insensitive, ignoring special characters)
   */
  private fuzzyMatch(str1: string, str2: string): boolean {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalize(str1) === normalize(str2);
  }

  /**
   * Remove a chord sheet from "My Chord Sheets" (set saved: 0)
   * Does not delete the record, just marks it as not saved for retention policy
   */
  async removeFromSaved(artist: string, title: string): Promise<void> {
    const existingRecord = await this.getRecord(artist, title);
    
    if (existingRecord?.saved) {
      // Update existing record to mark as not saved and set deletion timestamp
      existingRecord.saved = false; // This gets converted to 0 by recordToDB
      existingRecord.deletedAt = Date.now();
      await this.putRecord(existingRecord);
    }
    // If not found or already not saved, do nothing
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
}
