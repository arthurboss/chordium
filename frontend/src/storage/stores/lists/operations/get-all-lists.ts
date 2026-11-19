/**
 * Retrieves every custom list, ordered for display
 */
import type { StoredList } from "../../../types/stored-list";
import { executeReadTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";

export default async function getAllLists(): Promise<StoredList[]> {
  const lists = await executeReadTransaction<StoredList[]>(STORES.LISTS, (store) =>
    store.getAll()
  );
  return [...lists].sort((a, b) => a.order - b.order);
}
