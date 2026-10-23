/**
 * Deletes a custom list and its membership rows
 */
import type { StoredListItem } from "../../../types/stored-list";
import { executeReadTransaction, executeWriteTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";

/**
 * Deletes a list and every membership row pointing at it. Chord sheets and
 * their metadata are never touched here, since lists only ever reference
 * them by path rather than owning any of that data.
 */
export default async function deleteList(id: string): Promise<void> {
  const items = await executeReadTransaction<StoredListItem[]>(STORES.LIST_ITEMS, (store) =>
    store.index("listId").getAll(id)
  );

  for (const item of items) {
    await executeWriteTransaction(STORES.LIST_ITEMS, (store) => store.delete(item.id));
  }

  await executeWriteTransaction(STORES.LISTS, (store) => store.delete(id));
}
