/**
 * Database schema creation for chord sheets storage
 */

import { STORES } from '../../../../core/config/stores';
import { INDEXES } from '../../../../core/config/indexes';

/**
 * @param db - IDBDatabase instance to create schema on
 */
export default function createSchema(db: IDBDatabase): void {
  const store = db.createObjectStore(STORES.CHORD_SHEETS, { keyPath: 'path' });
  
  const indexes = INDEXES.chordSheets;
  store.createIndex('artist', indexes.artist, { unique: false });
  store.createIndex('title', indexes.title, { unique: false });
  store.createIndex('saved', indexes.saved, { unique: false });
  store.createIndex('lastAccessed', indexes.lastAccessed, { unique: false });
  store.createIndex('timestamp', indexes.timestamp, { unique: false });
  store.createIndex('expiresAt', indexes.expiresAt, { unique: false });
}
