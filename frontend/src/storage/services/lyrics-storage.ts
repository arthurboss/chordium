import { STORES } from '@/storage/core/config/stores';
import { getDatabase } from '@/storage/stores/chord-sheets/database/connection';

export interface StoredLyrics {
  path: string;
  /** Translated lyrics, keyed by the app language they were produced for. */
  translations?: Record<string, string>;
  timestamp: number;
}

/**
 * Translations carry no expiry of their own: like the full arrangement, they are
 * content belonging to a song, and how long that song is kept is recorded once
 * on its metadata. Saving a song therefore keeps its translations until it is
 * deleted, and an unsaved song loses them when its metadata lapses.
 */

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore, tx: IDBTransaction) => T | Promise<T>,
  fallback: T
): Promise<T> {
  const db = await getDatabase();
  // Older databases predate the store; callers treat that as "nothing cached".
  if (!db.objectStoreNames.contains(STORES.SONG_LYRICS)) return fallback;
  const tx = db.transaction(STORES.SONG_LYRICS, mode);
  return run(tx.objectStore(STORES.SONG_LYRICS), tx);
}

function readEntry(store: IDBObjectStore, songPath: string): Promise<StoredLyrics | undefined> {
  const request = store.get(songPath) as IDBRequest<StoredLyrics | undefined>;
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function awaitTx(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Adds one language's translation, leaving translations already stored for other
 * languages in place so switching the app language back does not re-translate.
 */
export async function storeTranslation(
  songPath: string,
  language: string,
  translated: string
): Promise<void> {
  try {
    await withStore(
      'readwrite',
      async (store, tx) => {
        const existing = await readEntry(store, songPath);
        store.put({
          path: songPath,
          translations: { ...existing?.translations, [language]: translated },
          timestamp: Date.now(),
        } satisfies StoredLyrics);
        await awaitTx(tx);
      },
      undefined
    );
  } catch (error) {
    console.error('Failed to store translation:', error);
  }
}

export async function getTranslation(songPath: string, language: string): Promise<string | null> {
  try {
    return await withStore(
      'readonly',
      async (store) => (await readEntry(store, songPath))?.translations?.[language] ?? null,
      null
    );
  } catch (error) {
    console.warn('Failed to read translation from storage:', error);
    return null;
  }
}

export async function deleteLyrics(songPath: string): Promise<void> {
  try {
    await withStore(
      'readwrite',
      async (store, tx) => {
        store.delete(songPath);
        await awaitTx(tx);
      },
      undefined
    );
  } catch (error) {
    console.error('Failed to delete translations:', error);
  }
}
