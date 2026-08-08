import { STORES } from '@/storage/core/config/stores';
import { getDatabase } from '@/storage/stores/chord-sheets/database/connection';
import type { ChordSheet } from '@/../shared/types/index.js';

export interface StoredLyrics {
  path: string;
  original?: string;
  translated?: string;
  timestamp: number;
  expiresAt: number;
}

const LYRICS_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function storeLyrics(songPath: string, lyrics: ChordSheet['lyrics']): Promise<void> {
  const db = await getDatabase();
  const tx = db.transaction(STORES.SONG_LYRICS, 'readwrite');
  const store = tx.objectStore(STORES.SONG_LYRICS);

  const now = Date.now();
  const entry: StoredLyrics = {
    path: songPath,
    original: lyrics?.original,
    translated: lyrics?.translated,
    timestamp: now,
    expiresAt: now + LYRICS_TTL,
  };

  store.put(entry);
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getLyrics(songPath: string): Promise<ChordSheet['lyrics'] | null> {
  try {
    const db = await getDatabase();
    const tx = db.transaction(STORES.SONG_LYRICS, 'readonly');
    const store = tx.objectStore(STORES.SONG_LYRICS);
    const entry = store.get(songPath) as IDBRequest<StoredLyrics | undefined>;

    return new Promise((resolve, reject) => {
      entry.onsuccess = () => {
        const result = entry.result;
        if (!result) {
          resolve(null);
          return;
        }

        if (result.expiresAt < Date.now()) {
          // Entry expired, delete it and return null
          const deleteTx = db.transaction(STORES.SONG_LYRICS, 'readwrite');
          deleteTx.objectStore(STORES.SONG_LYRICS).delete(songPath);
          resolve(null);
          return;
        }

        resolve({
          original: result.original,
          translated: result.translated,
        });
      };
      entry.onerror = () => reject(entry.error);
    });
  } catch (error) {
    console.error('Failed to get lyrics from storage:', error);
    return null;
  }
}

export async function deleteLyrics(songPath: string): Promise<void> {
  try {
    const db = await getDatabase();
    const tx = db.transaction(STORES.SONG_LYRICS, 'readwrite');
    tx.objectStore(STORES.SONG_LYRICS).delete(songPath);

    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(undefined);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Failed to delete lyrics:', error);
  }
}
