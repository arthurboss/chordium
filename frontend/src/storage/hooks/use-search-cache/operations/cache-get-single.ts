import { useCallback } from "react";
import type { UseSearchCacheParams } from "../params.types";
import type { UseSearchCacheAction } from "../state/use-search-cache-state";
import { searchCacheService } from "../../../services/search-cache/search-cache-service";
import { logger } from "./logger";

/**
 * Retrieves individual cache entries by path
 */
export function useCacheGetSingle(
  params: UseSearchCacheParams,
  dispatch: React.Dispatch<UseSearchCacheAction>
) {
  const { path } = params;

  const getFromCache = useCallback(async () => {
    if (!path) {
      logger.warn("Missing path parameter for cache retrieval", {
        path: !!path,
      });
      return null;
    }

    try {
      dispatch({ type: "LOADING_START" });
      
      const cacheEntry = await searchCacheService.get(path);

      dispatch({ 
        type: "LOADING_SUCCESS", 
        payload: cacheEntry 
      });

      logger.info("Successfully retrieved search cache entry", {
        path,
        found: !!cacheEntry,
      });

      return cacheEntry;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to retrieve from cache";
      logger.error("Failed to get search cache entry", {
        error: errorMessage,
        path,
      });
      
      dispatch({ 
        type: "LOADING_ERROR", 
        payload: errorMessage 
      });
      
      throw error;
    }
  }, [path, dispatch]);

  return {
    getFromCache,
  };
}
