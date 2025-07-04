import { CHORD_SHEET_DB_SCHEMA } from '../schema/unified-cache-db-schema';

/**
 * IndexedDB connection manager for all cache databases
 * Follows SRP: Single responsibility for database connection lifecycle
 */
export class ChordSheetDBConnection {
  private db: IDBDatabase | null = null;

  /**
   * Initialize database connection and create object stores
   * @returns Promise resolving to IDBDatabase instance
   */
  async initialize(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CHORD_SHEET_DB_SCHEMA.name, CHORD_SHEET_DB_SCHEMA.version);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create chord sheets object store
        if (!db.objectStoreNames.contains(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name)) {
          const chordStore = db.createObjectStore(
            CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name,
            { keyPath: CHORD_SHEET_DB_SCHEMA.stores.chordSheets.keyPath }
          );

          // Create chord sheet indexes
          CHORD_SHEET_DB_SCHEMA.stores.chordSheets.indexes.forEach(index => {
            chordStore.createIndex(index.name, index.keyPath, { unique: index.unique });
          });
        }

        // Create search cache object store
        if (!db.objectStoreNames.contains(CHORD_SHEET_DB_SCHEMA.stores.searchCache.name)) {
          const searchStore = db.createObjectStore(
            CHORD_SHEET_DB_SCHEMA.stores.searchCache.name,
            { keyPath: CHORD_SHEET_DB_SCHEMA.stores.searchCache.keyPath }
          );

          // Create search cache indexes
          CHORD_SHEET_DB_SCHEMA.stores.searchCache.indexes.forEach(index => {
            searchStore.createIndex(index.name, index.keyPath, { unique: index.unique });
          });
        }

        // Create artist cache object store
        if (!db.objectStoreNames.contains(CHORD_SHEET_DB_SCHEMA.stores.artistCache.name)) {
          const artistStore = db.createObjectStore(
            CHORD_SHEET_DB_SCHEMA.stores.artistCache.name,
            { keyPath: CHORD_SHEET_DB_SCHEMA.stores.artistCache.keyPath }
          );

          // Create artist cache indexes
          CHORD_SHEET_DB_SCHEMA.stores.artistCache.indexes.forEach(index => {
            artistStore.createIndex(index.name, index.keyPath, { unique: index.unique });
          });
        }
      };
    });
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
