import { STORES } from '@/storage/core/config/stores';
import { getDatabase } from '@/storage/stores/chord-sheets/database/connection';
import type { ChordSheet } from '@/../shared/types/index.js';

export interface StoredLyrics {
  path: string;
  original?: string;
  translated?: string;
  timestamp: number;
  expiresAt: number;
  /** Extractor version that produced this entry; see LYRICS_EXTRACTOR_VERSION. */
  version?: number;
}

const LYRICS_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Bump when a fix changes what the extractor produces, so entries cached by the
 * previous version are refetched instead of being served for the rest of their
 * TTL. Version 2 reads the lines with their breaks intact, without which no
 * translation was ever detected.
 */
export const LYRICS_EXTRACTOR_VERSION = 2;

export async function storeLyrics(songPath: string, lyrics: ChordSheet['lyrics']): Promise<void> {
  try {
    const db = await getDatabase();
    
    // Check if store exists (gracefully handle old DB versions)
    if (!db.objectStoreNames.contains(STORES.SONG_LYRICS)) {
      return; // Store not available yet; skip silently
    }
    
    const tx = db.transaction(STORES.SONG_LYRICS, 'readwrite');
    const store = tx.objectStore(STORES.SONG_LYRICS);

    const now = Date.now();
    const entry: StoredLyrics = {
      path: songPath,
      original: lyrics?.original,
      translated: lyrics?.translated,
      timestamp: now,
      expiresAt: now + LYRICS_TTL,
      version: LYRICS_EXTRACTOR_VERSION,
    };

    store.put(entry);
    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(undefined);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Failed to store lyrics:', error);
  }
}

export async function getLyrics(songPath: string): Promise<ChordSheet['lyrics'] | null> {
  try {
    const db = await getDatabase();
    
    // Check if store exists (gracefully handle old DB versions)
    if (!db.objectStoreNames.contains(STORES.SONG_LYRICS)) {
      return null; // Store not available yet; return null silently
    }
    
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

        if (result.expiresAt < Date.now() || (result.version ?? 1) < LYRICS_EXTRACTOR_VERSION) {
          // Expired, or written by an older extractor: drop it and report the
          // entry as absent so the caller refetches once.
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
    console.warn('Failed to get lyrics from storage:', error);
    return null;
  }
}

export async function deleteLyrics(songPath: string): Promise<void> {
  try {
    const db = await getDatabase();
    
    // Check if store exists (gracefully handle old DB versions)
    if (!db.objectStoreNames.contains(STORES.SONG_LYRICS)) {
      return; // Store not available yet; skip silently
    }
    
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
