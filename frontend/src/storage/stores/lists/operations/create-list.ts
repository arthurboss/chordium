/**
 * Creates a new custom list
 */
import { v4 as uuidv4 } from "uuid";
import type { StoredList } from "../../../types/stored-list";
import { executeReadTransaction, executeWriteTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";
import toTitleCase from "./to-title-case";
import DuplicateListNameError from "./duplicate-list-name-error";

/**
 * @param name - Display name for the new list
 * @returns The created list
 * @throws {Error} When name is empty
 * @throws {DuplicateListNameError} When another list already has this name
 */
export default async function createList(name: string): Promise<StoredList> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("List name is required");
  }

  const existing = await executeReadTransaction<StoredList[]>(STORES.LISTS, (store) =>
    store.getAll()
  );

  const titleCased = toTitleCase(trimmed);
  if (existing.some((list) => list.name.toLowerCase() === titleCased.toLowerCase())) {
    throw new DuplicateListNameError();
  }

  const list: StoredList = {
    id: uuidv4(),
    name: titleCased,
    source: "manual",
    order: existing.length,
    createdAt: Date.now(),
  };

  await executeWriteTransaction(STORES.LISTS, (store) => store.put(list));

  return list;
}
