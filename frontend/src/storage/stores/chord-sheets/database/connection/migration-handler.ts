/**
 * IndexedDB Migration Handler
 *
 * Handles all schema upgrades for the Chordium database.
 * Add a new case for each schema version, and implement the required migration logic.
 *
 * Usage: Called from onupgradeneeded in database initialization.
 */
// Types are provided by the DOM, no need to import from 'idb'.
import createSchema from './create-schema';
import { STORES } from '../../../../core/config/stores';

/**
 * Handles all IndexedDB migrations from oldVersion to newVersion.
 *
 * @param db - The IDBDatabase instance
 * @param oldVersion - The previous version of the database
 * @param newVersion - The new version being migrated to
 */
export function handleIndexedDBMigrations(db: IDBDatabase, oldVersion: number, newVersion: number): void {
  for (let v = oldVersion + 1; v <= newVersion; v++) {
    switch (v) {
      case 1:
        // Initial schema setup
        createSchema(db, 1);
        break;
      case 2: {
        // Migration to v2: change searchCache store keyPath from 'path' to 'searchKey'
        if (db.objectStoreNames.contains('searchCache')) {
          db.deleteObjectStore('searchCache');
        }
        const searchCacheStore = db.createObjectStore('searchCache', { keyPath: 'searchKey' });
        // Recreate indexes for searchCache
        searchCacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        searchCacheStore.createIndex('searchType', 'searchType', { unique: false });
        searchCacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        break;
      }
      case 3: {
        // Migration to v3: True lazy loading with separate metadata and content stores
        createSchema(db, 3);
        
        // Note: Data migration will be handled asynchronously after schema creation
        // The actual data migration happens in the application layer to avoid
        // blocking the database upgrade transaction
        break;
      }
      case 4: {
        // Migration to v4: Remove storage indexes from chordSheets content store
        // Content store is now controlled by metadata store, no indexes needed
        if (db.objectStoreNames.contains(STORES.CHORD_SHEETS)) {
          // Delete and recreate the content store without indexes
          db.deleteObjectStore(STORES.CHORD_SHEETS);
          const contentStore = db.createObjectStore(STORES.CHORD_SHEETS, { keyPath: 'path' });
          // No indexes needed - content store is controlled by metadata store
        }
        break;
      }
      // Add future migrations here
      default:
        break;
    }
  }
}
