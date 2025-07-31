import type { StoredChordSheet } from "../../../types";
import { executeReadTransaction } from "../utils/transactions";

/**
 * @returns Chord sheets marked as saved by the user
 * @throws {DatabaseOperationError} When storage access fails
 */
export default async function getAllSavedChordSheets(): Promise<
  StoredChordSheet[]
> {
  return executeReadTransaction<StoredChordSheet[]>((store) =>
    store.getAll()
  ).then((allRecords) =>
    allRecords.filter((record) => record.storage?.saved === true)
  );
}
