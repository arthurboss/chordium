import { executeWriteTransaction } from "../utils/transactions";

/**
 * @returns Promise that resolves when all data is cleared
 * @throws {DatabaseOperationError} When storage operation fails
 */
export default async function deleteAllChordSheets(): Promise<void> {
  return executeWriteTransaction((store) => store.clear());
}
