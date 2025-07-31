import type { StoredChordSheet } from "../../../types/chord-sheet";
import { executeWriteTransaction } from "../utils/transactions";

/**
 * @param path - Song identifier to remove
 * @throws {DatabaseOperationError} When storage operation fails
 */
export default async function deleteChordSheet(
  path: StoredChordSheet["path"]
): Promise<void> {
  if (!path) {
    throw new Error("Path is required for delete operation");
  }

  return executeWriteTransaction((store) => {
    return store.delete(path);
  });
}
