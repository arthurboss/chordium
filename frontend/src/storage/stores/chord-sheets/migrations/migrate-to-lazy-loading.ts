/**
 * Migration utility to convert existing chord sheet data to lazy loading format
 */

import { executeReadTransaction, executeWriteTransaction } from "../../../core/transactions";
import { getDatabase } from "../database/connection";
import { STORES } from "../../../core/config/stores";
import { splitChordSheet } from "../utils/split-chord-sheet";
import type { StoredChordSheet } from "../../../types/chord-sheet";

/**
 * Migrates existing chord sheet data from the old single-store format to the new lazy loading format
 * This should be called during database upgrade from v1 to v2
 * 
 * @param db - IDBDatabase instance
 * @throws {Error} When migration fails
 */
export async function migrateToLazyLoading(db: IDBDatabase): Promise<void> {
  try {
    // Check if old store exists
    if (!db.objectStoreNames.contains('chordSheets')) {
      console.log('No legacy chordSheets store found, skipping migration');
      return;
    }

    console.log('Starting migration from legacy chordSheets to lazy loading format...');

    // Read all existing chord sheets from the old store
    const existingChordSheets = await executeReadTransaction<StoredChordSheet[]>(
      'chordSheets',
      (store) => {
        return new Promise((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }
    );

    console.log(`Found ${existingChordSheets.length} chord sheets to migrate`);

    // Split each chord sheet into metadata and content
    for (const chordSheet of existingChordSheets) {
      const { metadata, content } = splitChordSheet(chordSheet);

      // Store metadata
      await executeWriteTransaction(STORES.SONGS_METADATA, (store) => {
        store.put(metadata);
      });

      // Store content
      await executeWriteTransaction(STORES.CHORD_SHEETS, (store) => {
        store.put(content);
      });
    }

    console.log(`Successfully migrated ${existingChordSheets.length} chord sheets`);

    // Delete the old store after successful migration
    await new Promise<void>((resolve, reject) => {
      const deleteRequest = db.deleteObjectStore('chordSheets');
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw new Error(`Failed to migrate chord sheet data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
