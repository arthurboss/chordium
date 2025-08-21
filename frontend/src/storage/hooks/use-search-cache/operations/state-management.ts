import { useCallback } from "react";
import type { UseSearchCacheAction } from "../state/use-search-cache-state";

/**
 * Manages hook loading states during cache operations
 */
export function useStateManagement(
  dispatch: React.Dispatch<UseSearchCacheAction>
) {
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, [dispatch]);

  const clearCacheEntry = useCallback(() => {
    dispatch({ type: "CLEAR_CACHE_ENTRY" });
  }, [dispatch]);

  return {
    clearError,
    clearCacheEntry,
  };
}
