import { useCallback } from "react";
import type { UseSearchCacheAction } from "../state/use-search-cache-state";
import { searchCacheService } from "../../../services/search-cache/search-cache-service";
import { logger } from "./logger";

/**
 * Retrieves all cached entries at once
 */
export function useCacheGetAll(
  dispatch: React.Dispatch<UseSearchCacheAction>
) {
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
    getAllFromCache,
  };
}
