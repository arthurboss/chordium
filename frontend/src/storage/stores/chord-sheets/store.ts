/**
 * IndexedDB chord sheet store operations
 * 
 * Provides CRUD operations for chord sheet storage in IndexedDB. This store
 * handles both saved chord sheets (user favorites) and cached chord sheets
 * (temporary storage with TTL). Uses Song.path as the primary key for
 * consistency with the existing domain model.
 */

import type { ChordSheet } from '@chordium/types';
import type { StoredChordSheet } from '../../types';
import { createStoredChordSheet } from './utils/stored-chord-sheet-factory';
import { getDatabase } from './database/connection';

/**
 * Store for chord sheet operations in IndexedDB
 * 
 * Implements the chord sheet storage interface with proper error handling,
 * transaction management, and schema consistency. All operations use the
 * existing Song.path format for keys to maintain compatibility.
 */
export class ChordSheetStore {
  /**
   * Get all saved chord sheets (with saved: true)
   * 
   * @returns Promise resolving to array of saved StoredChordSheet objects
   * @throws {Error} When database operation fails
   */
  async getAllSaved(): Promise<StoredChordSheet[]> {
    const db = await getDatabase();
    const transaction = db.transaction(['chordSheets'], 'readonly');
    const store = transaction.objectStore('chordSheets');
    
    return new Promise((resolve, reject) => {
      // Get all records and filter in memory instead of using index
      // This avoids the IDBKeyRange issue with nested properties
      const request = store.getAll();
      request.onerror = () => {
        reject(new Error(`Failed to get saved chord sheets: ${request.error?.message || 'Unknown error'}`));
      };
      request.onsuccess = () => {
        const allRecords = request.result as StoredChordSheet[];
        const savedRecords = allRecords.filter(record => record.storage?.saved === true);
        resolve(savedRecords);
      };
    });
  }  /**
   * Store a chord sheet with metadata using Song.path as key
   * 
   * Stores a chord sheet in IndexedDB with the provided metadata. The songPath
   * parameter should be the Song.path value to maintain consistency with the
   * existing domain model and routing system.
   * 
   * @param chordSheet - The chord sheet data to store
   * @param metadata - Storage metadata including saved status and source
   * @param songPath - The Song.path to use as the storage key
   * @returns Promise that resolves when storage is complete
   * @throws {Error} When database operation fails
   */
  async store(
    chordSheet: ChordSheet,
    metadata: { saved: boolean; source?: string },
    songPath: string
  ): Promise<void> {
    const db = await getDatabase();
    const transaction = db.transaction(['chordSheets'], 'readwrite');
    const store = transaction.objectStore('chordSheets');
    
    const storedChordSheet = createStoredChordSheet(chordSheet, songPath, metadata);

    return new Promise((resolve, reject) => {
      const request = store.put(storedChordSheet);
      request.onerror = () => reject(new Error(`Failed to store chord sheet: ${request.error?.message || 'Unknown error'}`));
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get a specific chord sheet by Song.path
   * 
   * Retrieves a chord sheet from storage using the Song.path as the key.
   * Returns null if the chord sheet is not found in storage.
   * 
   * @param songPath - The Song.path identifier for the chord sheet
   * @returns Promise resolving to StoredChordSheet or null if not found
   * @throws {Error} When database operation fails
   */
  async get(songPath: string): Promise<StoredChordSheet | null> {
    const db = await getDatabase();
    const transaction = db.transaction(['chordSheets'], 'readonly');
    const store = transaction.objectStore('chordSheets');
    
    return new Promise((resolve, reject) => {
      const request = store.get(songPath);
      request.onerror = () => reject(new Error(`Failed to get chord sheet: ${request.error?.message || 'Unknown error'}`));
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Delete a chord sheet by Song.path
   * 
   * Removes a chord sheet from storage using the Song.path as the key.
   * Operation succeeds silently if the chord sheet doesn't exist.
   * 
   * @param songPath - The Song.path identifier for the chord sheet to delete
   * @returns Promise that resolves when deletion is complete
   * @throws {Error} When database operation fails
   */
  async delete(songPath: string): Promise<void> {
    const db = await getDatabase();
    const transaction = db.transaction(['chordSheets'], 'readwrite');
    const store = transaction.objectStore('chordSheets');
    
    return new Promise((resolve, reject) => {
      const request = store.delete(songPath);
      request.onerror = () => reject(new Error(`Failed to delete chord sheet: ${request.error?.message || 'Unknown error'}`));
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Delete all chord sheets from storage
   * 
   * Clears all chord sheet data from the IndexedDB store. This operation
   * is primarily intended for testing and cleanup scenarios.
   * 
   * @returns Promise that resolves when all data is cleared
   * @throws {Error} When database operation fails
   */
  async deleteAll(): Promise<void> {
    const db = await getDatabase();
    const transaction = db.transaction(['chordSheets'], 'readwrite');
    const store = transaction.objectStore('chordSheets');
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(new Error(`Failed to clear chord sheets: ${request.error?.message || 'Unknown error'}`));
      request.onsuccess = () => resolve();
    });
  }
}
