/**
 * Custom list storage interface for grouping saved chord sheets
 */

import type { StoredList, StoredListItem } from "../../types/stored-list";
import {
  createList,
  getAllLists,
  renameList,
  deleteList,
  addItemToList,
  removeItemFromList,
  getAllListItems,
} from "./operations";

/**
 * Manages custom list storage operations
 */
export class ListsStore {
  /** Get every list, ordered for display */
  async getAll(): Promise<StoredList[]> {
    return getAllLists();
  }

  /** Get every list/path membership row, across all lists */
  async getAllItems(): Promise<StoredListItem[]> {
    return getAllListItems();
  }

  /** Create a new list with the given name */
  async create(name: string): Promise<StoredList> {
    return createList(name);
  }

  /** Rename an existing list */
  async rename(id: string, name: string): Promise<void> {
    return renameList(id, name);
  }

  /** Delete a list and its membership rows (never touches chord sheets) */
  async delete(id: string): Promise<void> {
    return deleteList(id);
  }

  /** Add a saved chord sheet to a list */
  async addItem(listId: string, path: string): Promise<void> {
    return addItemToList(listId, path);
  }

  /** Remove a saved chord sheet from a list */
  async removeItem(listId: string, path: string): Promise<void> {
    return removeItemFromList(listId, path);
  }
}
