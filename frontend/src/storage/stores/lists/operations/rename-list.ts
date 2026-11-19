/**
 * Renames an existing custom list
 */
import type { StoredList } from "../../../types/stored-list";
import { executeReadTransaction, executeWriteTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";
import toTitleCase from "./to-title-case";
import DuplicateListNameError from "./duplicate-list-name-error";

/**
 * @param id - List id to rename
 * @param name - New display name
 * @throws {Error} When name is empty
 * @throws {DuplicateListNameError} When another list already has this name
 */
export default async function renameList(id: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("List name is required");
  }

  const lists = await executeReadTransaction<StoredList[]>(STORES.LISTS, (store) =>
    store.getAll()
  );
  const list = lists.find((stored) => stored.id === id);
  if (!list) return;

  const titleCased = toTitleCase(trimmed);
  const isDuplicate = lists.some(
    (stored) => stored.id !== id && stored.name.toLowerCase() === titleCased.toLowerCase()
  );
  if (isDuplicate) {
    throw new DuplicateListNameError();
  }

  await executeWriteTransaction(STORES.LISTS, (store) =>
    store.put({ ...list, name: titleCased })
  );
}
