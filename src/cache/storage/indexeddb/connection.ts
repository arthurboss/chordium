import { CHORD_SHEET_DB_SCHEMA } from './schema';

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
        const transaction = (event.target as IDBOpenDBRequest).transaction;
        const oldVersion = event.oldVersion;
        
        this.handleDatabaseUpgrade(db, transaction, oldVersion);
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

  /**
   * Handle database schema upgrades
   */
  private handleDatabaseUpgrade(db: IDBDatabase, transaction: IDBTransaction | null, oldVersion: number): void {
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
    } else if (oldVersion < 6 && transaction) {
      // Upgrading from version 5: re-add the saved index and migrate boolean values
      const chordStore = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);
      
      // Re-create the saved index if it doesn't exist
      if (!chordStore.indexNames.contains('saved')) {
        chordStore.createIndex('saved', 'saved', { unique: false });
      }
      
      // Migrate boolean saved values to numbers
      this.migrateSavedFieldToNumber(chordStore);
    } else if (oldVersion < 7 && transaction) {
      // Upgrading from version 6: migrate number saved values to strings
      const chordStore = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);
      
      // Migrate number saved values to strings for better IndexedDB filtering
      this.migrateSavedFieldToString(chordStore);
    } else if (oldVersion < 8 && transaction) {
      // Upgrading from version 7: migrate string saved values back to booleans for testing
      const chordStore = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);
      
      // Migrate string saved values back to booleans
      this.migrateSavedFieldToBoolean(chordStore);
    } else if (oldVersion < 9 && transaction) {
      // Upgrading from version 8: migrate boolean saved values to numbers for IndexedDB compatibility
      const chordStore = transaction.objectStore(CHORD_SHEET_DB_SCHEMA.stores.chordSheets.name);
      
      // Migrate boolean saved values to numbers
      this.migrateSavedFieldToNumber(chordStore);
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
  }

  /**
   * Migrate boolean saved field to number for IndexedDB compatibility
   */
  private migrateSavedFieldToNumber(chordStore: IDBObjectStore): void {
    const getAllRequest = chordStore.getAll();
    getAllRequest.onsuccess = () => {
      const records = getAllRequest.result;
      records.forEach(record => {
        if (typeof record.saved === 'boolean') {
          record.saved = record.saved ? 1 : 0;
          chordStore.put(record);
        }
      });
    };
  }

  /**
   * Migrate number saved field to string for better IndexedDB filtering
   */
  private migrateSavedFieldToString(chordStore: IDBObjectStore): void {
    const getAllRequest = chordStore.getAll();
    getAllRequest.onsuccess = () => {
      const records = getAllRequest.result;
      records.forEach(record => {
        // Convert number (0/1) to string ('unsaved'/'saved')
        if (typeof record.saved === 'number') {
          record.saved = record.saved === 1 ? 'saved' : 'unsaved';
          chordStore.put(record);
        }
      });
    };
  }

  /**
   * Migrate string saved field back to boolean for testing
   */
  private migrateSavedFieldToBoolean(chordStore: IDBObjectStore): void {
    const getAllRequest = chordStore.getAll();
    getAllRequest.onsuccess = () => {
      const records = getAllRequest.result;
      records.forEach(record => {
        // Convert string ('saved'/'unsaved') to boolean (true/false)
        if (typeof record.saved === 'string') {
          record.saved = record.saved === 'saved';
          chordStore.put(record);
        }
      });
    };
  }
}
