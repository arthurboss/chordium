/**
 * Database schema creation for chord sheets storage
 */

import { STORES } from '../../../../core/config/stores';
import { INDEXES } from '../../../../core/config/indexes';

/**
 * @param db - IDBDatabase instance to create schema on
 */
export default function createSchema(db: IDBDatabase): void {
  // Create chord sheets store
  const chordSheetsStore = db.createObjectStore(STORES.CHORD_SHEETS, { keyPath: 'path' });
  
  const chordSheetsIndexes = INDEXES.chordSheets;
  chordSheetsStore.createIndex('artist', chordSheetsIndexes.artist, { unique: false });
  chordSheetsStore.createIndex('title', chordSheetsIndexes.title, { unique: false });
  chordSheetsStore.createIndex('saved', chordSheetsIndexes.saved, { unique: false });
  chordSheetsStore.createIndex('lastAccessed', chordSheetsIndexes.lastAccessed, { unique: false });
  chordSheetsStore.createIndex('timestamp', chordSheetsIndexes.timestamp, { unique: false });
  chordSheetsStore.createIndex('expiresAt', chordSheetsIndexes.expiresAt, { unique: false });

  // Create search cache store
  const searchCacheStore = db.createObjectStore(STORES.SEARCH_CACHE, { keyPath: 'path' });
  
  const searchCacheIndexes = INDEXES.searchCache;
  searchCacheStore.createIndex('timestamp', searchCacheIndexes.timestamp, { unique: false });
  searchCacheStore.createIndex('searchType', searchCacheIndexes.searchType, { unique: false });
  searchCacheStore.createIndex('dataSource', searchCacheIndexes.dataSource, { unique: false });
  searchCacheStore.createIndex('expiresAt', searchCacheIndexes.expiresAt, { unique: false });
}
