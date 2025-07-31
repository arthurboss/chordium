/**
 * Saves chord sheets to user's local storage
 */

import type { ChordSheet, Song } from '@chordium/types';
import { createStoredChordSheet } from '../utils/factories';
import executeWriteTransaction from '../utils/transactions/write-transaction';

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
  const storedChordSheet = createStoredChordSheet(chordSheet, path, { saved });
  
  return executeWriteTransaction((store) => 
    store.put(storedChordSheet)
  );
}
