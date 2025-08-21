/**
 * Database schema creation for chord sheets storage
 */

import { STORES } from '../../../../core/config/stores';
import { INDEXES } from '../../../../core/config/indexes';

/**
 * @param db - IDBDatabase instance to create schema on
 * @param version - Schema version to create/migrate to
 */
export default function createSchema(db: IDBDatabase, version: number): void {
  // v1: Initial schema
  if (version === 1) {
    if (!db.objectStoreNames.contains(STORES.CHORD_SHEETS)) {
      const chordSheetsStore = db.createObjectStore(STORES.CHORD_SHEETS, { keyPath: 'path' });
      const chordSheetsIndexes = INDEXES.chordSheets;
      chordSheetsStore.createIndex('artist', chordSheetsIndexes.artist, { unique: false });
      chordSheetsStore.createIndex('title', chordSheetsIndexes.title, { unique: false });
      chordSheetsStore.createIndex('saved', chordSheetsIndexes.saved, { unique: false });
      chordSheetsStore.createIndex('lastAccessed', chordSheetsIndexes.lastAccessed, { unique: false });
      chordSheetsStore.createIndex('timestamp', chordSheetsIndexes.timestamp, { unique: false });
      chordSheetsStore.createIndex('expiresAt', chordSheetsIndexes.expiresAt, { unique: false });
    }
    if (!db.objectStoreNames.contains(STORES.SEARCH_CACHE)) {
      const searchCacheStore = db.createObjectStore(STORES.SEARCH_CACHE, { keyPath: 'searchKey' });
      const searchCacheIndexes = INDEXES.searchCache;
      searchCacheStore.createIndex('timestamp', searchCacheIndexes.timestamp, { unique: false });
      searchCacheStore.createIndex('searchType', searchCacheIndexes.searchType, { unique: false });
      searchCacheStore.createIndex('dataSource', searchCacheIndexes.dataSource, { unique: false });
      searchCacheStore.createIndex('expiresAt', searchCacheIndexes.expiresAt, { unique: false });
    }
  }

  // v2: Example migration (add new index, store, etc.)
  if (version === 2) {
    // Example: add a new index to an existing store (if not already present)
    // const store = db.transaction.objectStore(STORES.CHORD_SHEETS);
    // if (!store.indexNames.contains('newIndex')) {
    //   store.createIndex('newIndex', 'newIndex', { unique: false });
    // }
    // Add further migration logic as needed
  }
}
