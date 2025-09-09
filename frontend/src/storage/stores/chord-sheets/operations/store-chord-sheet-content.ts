/**
 * Stores chord sheet content in IndexedDB
 */

import type { Song } from "@chordium/types";
import type { StoredChordSheetContent } from "../../../types/chord-sheet-content";
import { executeWriteTransaction } from "../../../core/transactions";
import { getDatabase } from "../database/connection";
import { STORES } from "../../../core/config/stores";

/**
 * Stores chord sheet content in IndexedDB
 * 
 * @param content - Chord sheet content to store
 * @throws {DatabaseOperationError} When storage operation fails
 */
export default async function storeChordSheetContent(
  content: StoredChordSheetContent
): Promise<void> {
  // Ensure database initialization to prevent race conditions
  await getDatabase();

  await executeWriteTransaction(STORES.CHORD_SHEETS, (store) => {
    store.put(content);
  });
}
