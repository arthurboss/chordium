import { useState } from "react";
import type { StoredList, StoredListItem } from "@/storage/stores/lists";
import type { UseListsState } from "./types";

/**
 * State management for the custom lists hook
 */
export function useListsState(): UseListsState {
  const [lists, setLists] = useState<StoredList[]>([]);
  const [listItems, setListItems] = useState<StoredListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  return {
    lists,
    setLists,
    listItems,
    setListItems,
    isLoading,
    setIsLoading,
    error,
    setError,
  };
}
