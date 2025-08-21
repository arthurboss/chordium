import { useCallback } from "react";
import type { UseSearchCacheParams } from "../params.types";
import type { UseSearchCacheAction } from "../state/use-search-cache-state";
import { searchCacheService } from "../../../services/search-cache/search-cache-service";
import { logger } from "./logger";

/**
 * Deletes cached entries by searchKey or clears all cache
 */
export function useCacheDeletion(
  params: UseSearchCacheParams,
  dispatch: React.Dispatch<UseSearchCacheAction>
) {
  const { searchKey } = params;

  const deleteFromCache = useCallback(async () => {
    if (!searchKey) {
      logger.warn("Missing searchKey parameter for cache deletion", {
        searchKey: !!searchKey,
      });
      return;
    }

    try {
      dispatch({ type: "LOADING_START" });
      
      await searchCacheService.delete(searchKey);

      dispatch({ 
        type: "LOADING_SUCCESS", 
        payload: null 
      });

      logger.info("Successfully deleted search cache entry", {
        searchKey,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete from cache";
      logger.error("Failed to delete search cache entry", {
        error: errorMessage,
        searchKey,
      });
      
      dispatch({ 
        type: "LOADING_ERROR", 
        payload: errorMessage 
      });
      
      throw error;
    }
  }, [searchKey, dispatch]);

  const clearAllCache = useCallback(async () => {
    try {
      dispatch({ type: "LOADING_START" });
      
      await searchCacheService.clear();

      dispatch({ 
        type: "LOADING_SUCCESS", 
        payload: null 
      });

      logger.info("Successfully cleared all search cache");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to clear cache";
      logger.error("Failed to clear search cache", {
        error: errorMessage,
      });
      
      dispatch({ 
        type: "LOADING_ERROR", 
        payload: errorMessage 
      });
      
      throw error;
    }
  }, [dispatch]);

  return {
    deleteFromCache,
    clearAllCache,
  };
}
