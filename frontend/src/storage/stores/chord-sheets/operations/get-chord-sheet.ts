/**
 * Retrieves a chord sheet from IndexedDB storage
 */

import type { Song } from "@chordium/types";
import type { StoredChordSheet } from "../../../types/chord-sheet";
import { executeReadTransaction } from "../../../core/transactions";
import { getDatabase } from "../database/connection";
import { resolveSampleChordSheetPath } from "../../../services/sample-chord-sheets/path-resolver";

/**
 * Gets a stored chord sheet by its unique path identifier with enhanced lookup
 * 
 * Ensures database initialization before lookup and handles sample chord sheet
 * path resolution for consistent access across different ID formats.
 * 
 * @param path - Song path identifier
 * @returns StoredChordSheet if found, null otherwise
 * @throws {DatabaseOperationError} When storage access fails
 */
export default async function getChordSheet(
  path: Song["path"]
): Promise<StoredChordSheet | null> {
  // Ensure database initialization to prevent race conditions
  await getDatabase();

  // Try direct path lookup first
  let result = await executeReadTransaction<StoredChordSheet | undefined>(
    "chordSheets",
    (store) => store.get(path)
  );

  // If not found, try sample path resolution for format differences
  if (!result) {
    const resolvedPath = resolveSampleChordSheetPath(path);
    if (resolvedPath !== path) {
      result = await executeReadTransaction<StoredChordSheet | undefined>(
        "chordSheets",
        (store) => store.get(resolvedPath)
      );
    }
  }

  return result || null;
}
