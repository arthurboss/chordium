import { STORES } from '@/storage/core/config/stores';
import { getDatabase } from '@/storage/stores/chord-sheets/database/connection';
import type { TranslatableLanguage } from '@/services/translation/types';

/** Translated lyrics for one song, keyed by the app language each was produced for. */
export type LyricsTranslations = Partial<Record<TranslatableLanguage, string>>;

export interface StoredLyrics {
  path: string;
  translations: LyricsTranslations;
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

function readAll(store: IDBObjectStore): Promise<StoredLyrics[]> {
  const request = store.getAll() as IDBRequest<StoredLyrics[]>;
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
 * Merges translations into a song's entry, leaving languages already stored in
 * place so switching the app language back does not re-translate.
 */
export async function storeTranslations(
  songPath: string,
  translations: LyricsTranslations
): Promise<void> {
  try {
    await withStore(
      'readwrite',
      async (store, tx) => {
        const existing = await readEntry(store, songPath);
        store.put({
          path: songPath,
          translations: { ...existing?.translations, ...translations },
          timestamp: Date.now(),
        } satisfies StoredLyrics);
        await awaitTx(tx);
      },
      undefined
    );
  } catch (error) {
    console.error('Failed to store translations:', error);
  }
}

export function storeTranslation(
  songPath: string,
  language: TranslatableLanguage,
  translated: string
): Promise<void> {
  return storeTranslations(songPath, { [language]: translated });
}

export async function getTranslation(
  songPath: string,
  language: TranslatableLanguage
): Promise<string | null> {
  try {
    return await withStore(
      'readonly',
      async (store) => (await readEntry(store, songPath))?.translations[language] ?? null,
      null
    );
  } catch (error) {
    console.warn('Failed to read translation from storage:', error);
    return null;
  }
}

/** Which languages already have a translation stored for this song. */
export async function getTranslatedLanguages(songPath: string): Promise<TranslatableLanguage[]> {
  try {
    return await withStore(
      'readonly',
      async (store) => {
        const entry = await readEntry(store, songPath);
        return Object.keys(entry?.translations ?? {}) as TranslatableLanguage[];
      },
      []
    );
  } catch (error) {
    console.warn('Failed to read translation languages from storage:', error);
    return [];
  }
}

/** Which of the app's languages have translations stored for any song. */
export async function getStoredTranslationLanguages(): Promise<TranslatableLanguage[]> {
  try {
    return await withStore(
      'readonly',
      async (store) => {
        const entries = await readAll(store);
        const languages = new Set<TranslatableLanguage>();
        for (const entry of entries) {
          for (const language of Object.keys(entry.translations) as TranslatableLanguage[]) {
            languages.add(language);
          }
        }
        return [...languages];
      },
      []
    );
  } catch (error) {
    console.warn('Failed to read stored translation languages:', error);
    return [];
  }
}

/**
 * Drops one language's translations across every song, for readers reclaiming
 * space. The songs keep their other languages.
 */
export async function removeTranslationsForLanguage(
  language: TranslatableLanguage
): Promise<void> {
  try {
    await withStore(
      'readwrite',
      async (store, tx) => {
        for (const entry of await readAll(store)) {
          if (!(language in entry.translations)) continue;
          const { [language]: _removed, ...kept } = entry.translations;
          if (Object.keys(kept).length === 0) {
            store.delete(entry.path);
          } else {
            store.put({ ...entry, translations: kept } satisfies StoredLyrics);
          }
        }
        await awaitTx(tx);
      },
      undefined
    );
  } catch (error) {
    console.error('Failed to remove translations:', error);
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
