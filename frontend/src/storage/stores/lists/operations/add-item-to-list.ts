/**
 * Adds a saved chord sheet to a custom list
 */
import type { StoredListItem } from "../../../types/stored-list";
import { executeReadTransaction, executeWriteTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";
import itemId from "./item-id";

/**
 * @param listId - List to add the song to
 * @param path - StoredSongMetadata path identifying the song
 */
export default async function addItemToList(listId: string, path: string): Promise<void> {
  const existingItems = await executeReadTransaction<StoredListItem[]>(STORES.LIST_ITEMS, (store) =>
    store.index("listId").getAll(listId)
  );

  const item: StoredListItem = {
    id: itemId(listId, path),
    listId,
    path,
    order: existingItems.length,
  };

  await executeWriteTransaction(STORES.LIST_ITEMS, (store) => store.put(item));
}
