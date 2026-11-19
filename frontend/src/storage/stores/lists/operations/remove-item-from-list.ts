/**
 * Removes a saved chord sheet from a custom list
 */
import { executeWriteTransaction } from "../../../core/transactions";
import { STORES } from "../../../core/config/stores";
import itemId from "./item-id";

/**
 * @param listId - List to remove the song from
 * @param path - StoredSongMetadata path identifying the song
 */
export default async function removeItemFromList(listId: string, path: string): Promise<void> {
  await executeWriteTransaction(STORES.LIST_ITEMS, (store) => store.delete(itemId(listId, path)));
}
