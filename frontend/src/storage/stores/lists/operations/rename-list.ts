/**
 * Renames an existing custom list
 */
import type { StoredList } from "../../../types/stored-list";
import { executeReadTransaction, executeWriteTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";
import toTitleCase from "./to-title-case";

/**
 * @param id - List id to rename
 * @param name - New display name
 * @throws {Error} When name is empty
 */
export default async function renameList(id: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("List name is required");
  }

  const list = await executeReadTransaction<StoredList | undefined>(STORES.LISTS, (store) =>
    store.get(id)
  );
  if (!list) return;

  await executeWriteTransaction(STORES.LISTS, (store) =>
    store.put({ ...list, name: toTitleCase(trimmed) })
  );
}
