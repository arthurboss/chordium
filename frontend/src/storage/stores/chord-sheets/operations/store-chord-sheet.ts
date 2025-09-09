import type { ChordSheet, Song } from "@chordium/types";
import { executeWriteTransaction } from "../../../core/transactions";
import { splitChordSheet } from "../utils/split-chord-sheet";
import { STORES } from "../../../core/config/stores";

/**
 * @param chordSheet - Chord sheet content to save
 * @param saved - Whether this is a user-saved chord sheet (true) or cached (false)
 * @param path - Song identifier for retrieval
 * @returns Promise that resolves when storage is complete
 * @throws {DatabaseOperationError} When storage operation fails
 * @throws {StorageQuotaExceededError} When device storage is full
 */
export default async function storeChordSheet(
  chordSheet: ChordSheet,
  saved: boolean,
  path: Song["path"]
): Promise<void> {
  // Build a legacy-like stored object to leverage splitter
  const legacyLike = {
    ...chordSheet,
    path,
    storage: {
      timestamp: Date.now(),
      version: 1,
      expiresAt: saved ? null : Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days default
      saved,
      lastAccessed: Date.now(),
      accessCount: 1,
    },
  } as any;

  const { metadata, content } = splitChordSheet(legacyLike);

  // Persist metadata and content in their respective stores
  await executeWriteTransaction(STORES.SONGS_METADATA, (store) => store.put(metadata));
  await executeWriteTransaction(STORES.CHORD_SHEETS, (store) => store.put(content));
}
