/**
 * Retrieves a chord sheet from IndexedDB storage
 */

import type { Song } from "@chordium/types";
import type { StoredChordSheet } from "../../../types/chord-sheet";
import type { StoredChordSheetMetadata } from "../../../types/chord-sheet-metadata";
import type { StoredChordSheetContent } from "../../../types/chord-sheet-content";
import { executeReadTransaction } from "../../../core/transactions";
import { getDatabase } from "../database/connection";
import { resolveSampleChordSheetPath } from "../../../services/sample-chord-sheets/path-resolver";
import { STORES } from "../../../core/config/stores";
import { combineChordSheet } from "../utils/split-chord-sheet";

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

  // First try new split stores: metadata + content
  const metadata = await executeReadTransaction<StoredChordSheetMetadata | undefined>(STORES.SONGS_METADATA, (store) => store.get(path));
  const content = await executeReadTransaction<StoredChordSheetContent | undefined>(STORES.CHORD_SHEETS, (store) => store.get(path));
  if (metadata && content) {
    return combineChordSheet(metadata, content);
  }

  // Backward compatibility: check legacy store if still present
  let legacy = await executeReadTransaction<StoredChordSheet | undefined>(
    "chordSheets",
    (store) => store.get(path)
  );

  if (!legacy) {
    const resolvedPath = resolveSampleChordSheetPath(path);
    if (resolvedPath !== path) {
      legacy = await executeReadTransaction<StoredChordSheet | undefined>(
        "chordSheets",
        (store) => store.get(resolvedPath)
      );
    }
  }

  return legacy || null;
}
