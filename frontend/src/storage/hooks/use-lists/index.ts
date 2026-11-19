import { useCallback, useEffect, useMemo, useRef } from "react";
import type { UseListsResult } from "./types";
import { useListsState } from "./state";
import { useListsOperations } from "./operations";

export type { UseListsResult } from "./types";

/**
 * Custom favorite lists: user-named groupings of already-saved chord sheets.
 * Lists only ever reference a chord sheet by its path, so this hook loads
 * lists and membership rows once and derives lookups from them in memory.
 */
export function useLists(): UseListsResult {
  const state = useListsState();
  const { refreshLists, createList, renameList, deleteList, toggleListItem } =
    useListsOperations(state);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      void refreshLists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pathsByList = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const item of state.listItems) {
      const set = map.get(item.listId) ?? new Set<string>();
      set.add(item.path);
      map.set(item.listId, set);
    }
    return map;
  }, [state.listItems]);

  const listIdsByPath = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const item of state.listItems) {
      const ids = map.get(item.path) ?? [];
      ids.push(item.listId);
      map.set(item.path, ids);
    }
    return map;
  }, [state.listItems]);

  const getPathsForList = useCallback(
    (listId: string) => pathsByList.get(listId) ?? new Set<string>(),
    [pathsByList]
  );

  const getListIdsForPath = useCallback(
    (path: string) => listIdsByPath.get(path) ?? [],
    [listIdsByPath]
  );

  return {
    lists: state.lists,
    isLoading: state.isLoading,
    error: state.error,
    getPathsForList,
    getListIdsForPath,
    createList,
    renameList,
    deleteList,
    toggleListItem,
    refreshLists,
  };
}
