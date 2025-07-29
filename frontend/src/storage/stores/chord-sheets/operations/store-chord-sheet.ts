/**
 * Saves chord sheets to user's local storage
 */

import type { ChordSheet, Song } from '@chordium/types';
import { createStoredChordSheet } from '../utils/stored-chord-sheet-factory';
import executeWriteTransaction from '../utils/transactions/write-transaction';

/**
 * @param chordSheet - Chord sheet content to save
 * @param metadata - Storage options (saved status, source info)
 * @param path - Song identifier for retrieval
 * @returns Promise that resolves when storage is complete
 * @throws {DatabaseOperationError} When storage operation fails
 * @throws {StorageQuotaExceededError} When device storage is full
 */
export default async function storeChordSheet(
  chordSheet: ChordSheet,
  metadata: { saved: boolean; source?: string },
  path: Song["path"]
): Promise<void> {
  const storedChordSheet = createStoredChordSheet(chordSheet, path, metadata);
  
  return executeWriteTransaction((store) => 
    store.put(storedChordSheet)
  );
}
