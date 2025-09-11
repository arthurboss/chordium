import type { ChordSheet, Song, SongMetadata } from "@chordium/types";
import type { StoredSongMetadata } from "../../../types/stored-song-metadata";
import type { StoredChordSheet } from "../../../types/stored-chord-sheet";
import { executeWriteTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";

/**
 * Stores a chord sheet by splitting it into metadata and content
 * @param metadata - Song metadata to save
 * @param content - Chord sheet content to save
 * @param saved - Whether this is a user-saved chord sheet (true) or cached (false)
 * @param path - Song identifier for retrieval
 * @returns Promise that resolves when storage is complete
 * @throws {DatabaseOperationError} When storage operation fails
 * @throws {StorageQuotaExceededError} When device storage is full
 */
export default async function storeChordSheet(
  metadata: SongMetadata,
  content: ChordSheet,
  saved: boolean,
  path: Song["path"]
): Promise<void> {
  const now = Date.now();
  
  // Create stored metadata
  const storedMetadata: StoredSongMetadata = {
    title: metadata.title,
    artist: metadata.artist,
    songKey: metadata.songKey,
    guitarTuning: metadata.guitarTuning,
    guitarCapo: metadata.guitarCapo,
    path,
    storage: {
      timestamp: now,
      version: 1,
      expiresAt: saved ? null : now + 1000 * 60 * 60 * 24 * 7, // 7 days default
      saved,
      lastAccessed: now,
      accessCount: 1,
      contentAvailable: true,
    },
  };

  // Create stored content
  const storedContent: StoredChordSheet = {
    path,
    songChords: content.songChords,
  };

  // Persist metadata and content in their respective stores
  await executeWriteTransaction(STORES.SONGS_METADATA, (store) => store.put(storedMetadata));
  await executeWriteTransaction(STORES.CHORD_SHEETS, (store) => store.put(storedContent));
}
