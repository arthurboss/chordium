import { useCallback } from "react";
import { ListsStore } from "@/storage/stores/lists";
import type { StoredList } from "@/storage/stores/lists";
import type { UseListsState } from "./types";

/**
 * Data operations for custom lists
 */
export function useListsOperations(state: UseListsState) {
  const refreshLists = useCallback(async () => {
    try {
      state.setIsLoading(true);
      state.setError(null);
      const store = new ListsStore();
      const [lists, listItems] = await Promise.all([store.getAll(), store.getAllItems()]);
      state.setLists(lists);
      state.setListItems(listItems);
    } catch (err) {
      state.setError(err as Error);
    } finally {
      state.setIsLoading(false);
    }
  }, [state]);

  const createList = useCallback(
    async (name: string): Promise<StoredList> => {
      const store = new ListsStore();
      const list = await store.create(name);
      await refreshLists();
      return list;
    },
    [refreshLists]
  );

  const renameList = useCallback(
    async (id: string, name: string) => {
      const store = new ListsStore();
      await store.rename(id, name);
      await refreshLists();
    },
    [refreshLists]
  );

  const deleteList = useCallback(
    async (id: string) => {
      const store = new ListsStore();
      await store.delete(id);
      await refreshLists();
    },
    [refreshLists]
  );

  const toggleListItem = useCallback(
    async (listId: string, path: string) => {
      const store = new ListsStore();
      const alreadyIn = state.listItems.some(
        (item) => item.listId === listId && item.path === path
      );
      if (alreadyIn) {
        await store.removeItem(listId, path);
      } else {
        await store.addItem(listId, path);
      }
      await refreshLists();
    },
    [state, refreshLists]
  );

  return { refreshLists, createList, renameList, deleteList, toggleListItem };
}
