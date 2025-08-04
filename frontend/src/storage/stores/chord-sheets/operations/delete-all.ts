import { executeWriteTransaction } from "../../../core/transactions";

/**
 * @returns Promise that resolves when all data is cleared
 * @throws {DatabaseOperationError} When storage operation fails
 */
export default async function deleteAllChordSheets(): Promise<void> {
  return executeWriteTransaction("chordSheets", (store) => store.clear());
}
