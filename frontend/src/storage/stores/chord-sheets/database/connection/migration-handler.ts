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
 * @param transaction - The versionchange transaction, required by migrations
 *                      that rewrite existing records rather than only schema
 */
export function handleIndexedDBMigrations(
  db: IDBDatabase,
  oldVersion: number,
  newVersion: number,
  transaction?: IDBTransaction | null
): void {
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
      case 5: {
        // Migration to v5: add a separate store for full arrangements (with tabs),
        // used by the simplified/full toggle. Keyed by path, content only.
        if (!db.objectStoreNames.contains(STORES.FULL_CHORD_SHEETS)) {
          db.createObjectStore(STORES.FULL_CHORD_SHEETS, { keyPath: 'path' });
        }
        break;
      }
      case 6: {
        // Migration to v6: drop cached content scraped before the truncation
        // fix, which was silently cut short and would otherwise never refresh
        // (cached content is served without re-fetching).
        //
        // Only unsaved entries are cleared. Songs the user saved are left
        // untouched: their content store also holds user edits, and there is
        // no separate edited flag to tell an edit from a plain cache entry.
        dropUnsavedCachedContent(db, transaction);
        break;
      }
      case 7: {
        // Migration to v7: add a store for song lyrics (original + translated),
        // used by the lyrics view. Keyed by path.
        createSchema(db, 7);
        break;
      }
      case 8: {
        // Migration to v8: lyrics no longer expire on their own, so the index
        // and the field it pointed at are both removed.
        dropLyricsExpiry(transaction);
        break;
      }
      // Add future migrations here
      default:
        break;
    }
  }
}

/**
 * Deletes cached (unsaved) chord sheet content so it is re-fetched on next open.
 *
 * Walks songsMetadata rather than the content stores because `storage.saved`
 * lives on the metadata record. Metadata itself is kept so the entry keeps its
 * access history; clearing the content is enough to trigger a re-fetch, since
 * the viewer falls back to the API whenever content is missing and unsaved.
 */
function dropUnsavedCachedContent(db: IDBDatabase, transaction?: IDBTransaction | null): void {
  if (!transaction) return;
  if (!db.objectStoreNames.contains(STORES.SONGS_METADATA)) return;

  const metadataStore = transaction.objectStore(STORES.SONGS_METADATA);
  const contentStore = db.objectStoreNames.contains(STORES.CHORD_SHEETS)
    ? transaction.objectStore(STORES.CHORD_SHEETS)
    : null;
  const fullStore = db.objectStoreNames.contains(STORES.FULL_CHORD_SHEETS)
    ? transaction.objectStore(STORES.FULL_CHORD_SHEETS)
    : null;
  if (!contentStore && !fullStore) return;

  metadataStore.openCursor().onsuccess = (event) => {
    const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
    if (!cursor) return;

    const record = cursor.value as { path?: string; storage?: { saved?: boolean } };
    if (record?.path && !record.storage?.saved) {
      contentStore?.delete(record.path);
      fullStore?.delete(record.path);
      cursor.update({ ...record, storage: { ...record.storage, contentAvailable: false } });
    }
    cursor.continue();
  };
}

/**
 * Removes every trace of the lyrics store's own expiry, left over from when
 * lyrics expired independently of the song they belong to: the index, and the
 * field it pointed at on records written before this version.
 */
function dropLyricsExpiry(transaction?: IDBTransaction | null): void {
  if (!transaction) return;
  if (!transaction.db.objectStoreNames.contains(STORES.SONG_LYRICS)) return;

  const lyricsStore = transaction.objectStore(STORES.SONG_LYRICS);
  if (lyricsStore.indexNames.contains('expiresAt')) {
    lyricsStore.deleteIndex('expiresAt');
  }

  lyricsStore.openCursor().onsuccess = (event) => {
    const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
    if (!cursor) return;

    const { expiresAt, ...record } = cursor.value as Record<string, unknown>;
    if (expiresAt !== undefined) cursor.update(record);
    cursor.continue();
  };
}
