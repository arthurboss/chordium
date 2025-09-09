/**
 * Stores chord sheet metadata in IndexedDB
 */

import type { Song } from "@chordium/types";
import type { StoredChordSheetMetadata } from "../../../types/chord-sheet-metadata";
import { executeWriteTransaction } from "../../../core/transactions";
import { getDatabase } from "../database/connection";
import { STORES } from "../../../core/config/stores";

/**
 * Stores chord sheet metadata in IndexedDB
 * 
 * @param metadata - Chord sheet metadata to store
 * @throws {DatabaseOperationError} When storage operation fails
 */
export default async function storeChordSheetMetadata(
  metadata: StoredChordSheetMetadata
): Promise<void> {
  // Ensure database initialization to prevent race conditions
  await getDatabase();

  await executeWriteTransaction(STORES.SONGS_METADATA, (store) => {
    store.put(metadata);
  });
}
