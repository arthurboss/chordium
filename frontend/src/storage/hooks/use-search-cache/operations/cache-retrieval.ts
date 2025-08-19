import { useCallback } from "react";
import type { UseSearchCacheParams } from "../params.types";
import type { UseSearchCacheAction } from "../state/use-search-cache-state";
import { searchCacheService } from "../../../services/search-cache/search-cache-service";
import { logger } from "./logger";

/**
 * Retrieves cached search entries
 */
export function useCacheRetrieval(
  params: UseSearchCacheParams,
  dispatch: React.Dispatch<UseSearchCacheAction>
) {
  const { searchKey } = params;

  const getFromCache = useCallback(async () => {
    if (!searchKey) {
      logger.warn("Missing searchKey parameter for cache retrieval", {
        searchKey: !!searchKey,
      });
      return null;
    }

    try {
      dispatch({ type: "LOADING_START" });
      
      const cacheEntry = await searchCacheService.get(searchKey);

      dispatch({ 
        type: "LOADING_SUCCESS", 
        payload: cacheEntry 
      });

      return cacheEntry;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to retrieve from cache";
      logger.error("Failed to get search cache entry", {
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

  const getAllFromCache = useCallback(async () => {
    try {
      dispatch({ type: "LOADING_START" });
      
      const allEntries = await searchCacheService.getAll();

      dispatch({ 
        type: "LOADING_SUCCESS", 
        payload: null // This operation doesn't set a specific cache entry
      });

      logger.info("Successfully retrieved all cache entries", {
        entriesCount: allEntries.length,
      });

      return allEntries;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get all cache entries";
      logger.error("Failed to get all cache entries", {
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
    getFromCache,
    getAllFromCache,
  };
}
