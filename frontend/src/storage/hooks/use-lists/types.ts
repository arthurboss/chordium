import type React from "react";
import type { StoredList, StoredListItem } from "@/storage/stores/lists";

export interface UseListsState {
  lists: StoredList[];
  setLists: React.Dispatch<React.SetStateAction<StoredList[]>>;
  listItems: StoredListItem[];
  setListItems: React.Dispatch<React.SetStateAction<StoredListItem[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: Error | null;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
}

export interface UseListsResult {
  /** Every custom list, ordered for display */
  lists: StoredList[];
  /** Loading state for the initial fetch */
  isLoading: boolean;
  /** Any error from the initial fetch or a mutation */
  error: Error | null;
  /** Paths currently filed under the given list */
  getPathsForList: (listId: string) => Set<string>;
  /** Ids of every list a given chord sheet path currently belongs to */
  getListIdsForPath: (path: string) => string[];
  /** Create a new list with the given name */
  createList: (name: string) => Promise<StoredList>;
  /** Rename an existing list */
  renameList: (id: string, name: string) => Promise<void>;
  /** Delete a list and its membership rows (never touches chord sheets) */
  deleteList: (id: string) => Promise<void>;
  /** Add the path to the list if absent, remove it if already present */
  toggleListItem: (listId: string, path: string) => Promise<void>;
  /** Re-fetch lists and membership rows from storage */
  refreshLists: () => Promise<void>;
}
