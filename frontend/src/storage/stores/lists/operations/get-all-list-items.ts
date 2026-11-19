/**
 * Retrieves every list/path membership row
 */
import type { StoredListItem } from "../../../types/stored-list";
import { executeReadTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";

export default async function getAllListItems(): Promise<StoredListItem[]> {
  return executeReadTransaction<StoredListItem[]>(STORES.LIST_ITEMS, (store) => store.getAll());
}
