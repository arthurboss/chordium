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
  // v1: Initial schema creation
  if (version === 1) {
    if (!db.objectStoreNames.contains(STORES.CHORD_SHEETS)) {
      const chordSheetsStore = db.createObjectStore(STORES.CHORD_SHEETS, { keyPath: 'path' });
      // v1 had full chord sheet data with metadata indexes
      chordSheetsStore.createIndex('artist', 'artist', { unique: false });
      chordSheetsStore.createIndex('title', 'title', { unique: false });
      chordSheetsStore.createIndex('saved', 'storage.saved', { unique: false });
      chordSheetsStore.createIndex('lastAccessed', 'storage.lastAccessed', { unique: false });
      chordSheetsStore.createIndex('timestamp', 'storage.timestamp', { unique: false });
      chordSheetsStore.createIndex('expiresAt', 'storage.expiresAt', { unique: false });
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

  // v3: Lazy loading schema creation (separate metadata and content stores)
  if (version === 3) {
    // Create metadata store
    if (!db.objectStoreNames.contains(STORES.SONGS_METADATA)) {
      const metadataStore = db.createObjectStore(STORES.SONGS_METADATA, { keyPath: 'path' });
      const metadataIndexes = INDEXES.songsMetadata;
      metadataStore.createIndex('artist', metadataIndexes.artist, { unique: false });
      metadataStore.createIndex('title', metadataIndexes.title, { unique: false });
      metadataStore.createIndex('saved', metadataIndexes.saved, { unique: false });
      metadataStore.createIndex('lastAccessed', metadataIndexes.lastAccessed, { unique: false });
      metadataStore.createIndex('timestamp', metadataIndexes.timestamp, { unique: false });
      metadataStore.createIndex('expiresAt', metadataIndexes.expiresAt, { unique: false });
    }
    
    // Create content store (reuse chordSheets name for content)
    if (!db.objectStoreNames.contains(STORES.CHORD_SHEETS)) {
      const contentStore = db.createObjectStore(STORES.CHORD_SHEETS, { keyPath: 'path' });
      // No indexes needed - content store is controlled by metadata store
    }
  }
}
