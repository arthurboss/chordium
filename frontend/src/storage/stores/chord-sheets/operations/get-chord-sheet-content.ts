/**
 * Retrieves chord sheet content from IndexedDB storage
 */

import type { Song } from "@chordium/types";
import type { StoredChordSheetContent } from "../../../types/chord-sheet-content";
import { executeReadTransaction } from "../../../core/transactions";
import { getDatabase } from "../database/connection";
import { STORES } from "../../../core/config/stores";
import { resolveSampleChordSheetPath } from "../../../services/sample-chord-sheets/path-resolver";

/**
 * Gets stored chord sheet content by its unique path identifier
 * 
 * @param path - Song path identifier
 * @returns StoredChordSheetContent if found, null otherwise
 * @throws {DatabaseOperationError} When storage access fails
 */
export default async function getChordSheetContent(
  path: Song["path"]
): Promise<StoredChordSheetContent | null> {
  // Ensure database initialization to prevent race conditions
  await getDatabase();

  // Try direct path lookup first
  let result = await executeReadTransaction<StoredChordSheetContent | undefined>(
    STORES.CHORD_SHEETS,
    (store) => store.get(path)
  );

  // If not found, try sample path resolution for format differences
  if (!result) {
    const resolvedPath = resolveSampleChordSheetPath(path);
    if (resolvedPath !== path) {
      result = await executeReadTransaction<StoredChordSheetContent | undefined>(
        STORES.CHORD_SHEETS,
        (store) => store.get(resolvedPath)
      );
    }
  }

  return result || null;
}
