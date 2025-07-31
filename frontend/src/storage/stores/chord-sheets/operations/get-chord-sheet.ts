import type { Song } from "@chordium/types";
import type { StoredChordSheet } from "../../../types/chord-sheet";
import { executeReadTransaction } from "../utils/transactions";

/**
 * Gets a stored chord sheet by its unique path identifier
 * @param path - Song path identifier
 * @returns StoredChordSheet if found, null otherwise
 * @throws {DatabaseOperationError} When storage access fails
 */
export default async function getChordSheet(
  path: Song["path"]
): Promise<StoredChordSheet | null> {
  return executeReadTransaction<StoredChordSheet | undefined>((store) =>
    store.get(path)
  ).then((result) => result || null);
}
