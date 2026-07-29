import type { Song } from "@chordium/types";
import type { StoredChordSheet } from "../../../types/stored-chord-sheet";
import { executeReadTransaction } from "../../../core/transactions";
import { getDatabase } from "../database/connection";
import { resolveSampleChordSheetPath } from "../../../services/sample-chord-sheets/path-resolver";
import { STORES } from "../../../core/config/stores";

/**
 * Gets the stored full arrangement (with tabs) by path, if one has been fetched.
 *
 * @param path - Song path identifier
 * @returns StoredChordSheet if found, null otherwise
 */
export async function getFullChordSheetContent(
  path: Song["path"]
): Promise<StoredChordSheet | null> {
  await getDatabase();

  const content = await executeReadTransaction<StoredChordSheet | undefined>(
    STORES.FULL_CHORD_SHEETS,
    (store) => store.get(path)
  );
  if (content) return content;

  const resolvedPath = resolveSampleChordSheetPath(path);
  if (resolvedPath !== path) {
    const resolved = await executeReadTransaction<StoredChordSheet | undefined>(
      STORES.FULL_CHORD_SHEETS,
      (store) => store.get(resolvedPath)
    );
    if (resolved) return resolved;
  }

  return null;
}
