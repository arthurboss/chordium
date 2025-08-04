import { useCallback } from "react";
import type { Artist, Song } from "@chordium/types";
import type { UseSearchCacheParams } from "../params.types";
import type { UseSearchCacheAction } from "../state/use-search-cache-state";
import { searchCacheService } from "../../../services/search-cache/search-cache-service";
import { logger } from "./logger";

/**
 * Stores search results in cache with metadata
 */
export function useCacheStorage(
  params: UseSearchCacheParams,
  dispatch: React.Dispatch<UseSearchCacheAction>
) {
  const { dataSource, searchType, path, query } = params;

  const storeInCache = useCallback(async (results: unknown[]) => {
    if (!path || !query || !searchType || !dataSource) {
      logger.warn("Missing required parameters for cache storage", {
        path: !!path,
        query: !!query,
        searchType: !!searchType,
        dataSource: !!dataSource,
      });
      return;
    }

    try {
      dispatch({ type: "LOADING_START" });
      
      await searchCacheService.storeResults({
        path,
        results: results as Artist[] | Song[], // Type assertion since we can't know the exact type at runtime
        search: {
          query,
          searchType,
          dataSource,
        }
      });

      // Get the newly stored cache entry
      const cacheEntry = await searchCacheService.get(path);

      dispatch({ 
        type: "LOADING_SUCCESS", 
        payload: cacheEntry 
      });

      logger.info("Successfully stored search results in cache", {
        path,
        query,
        searchType,
        dataSource,
        resultsCount: results.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to store in cache";
      logger.error("Failed to store search results in cache", {
        error: errorMessage,
        path,
        query,
        searchType,
        dataSource,
        resultsCount: results.length,
      });
      
      dispatch({ 
        type: "LOADING_ERROR", 
        payload: errorMessage 
      });
      
      throw error;
    }
  }, [path, query, searchType, dataSource, dispatch]);

  return {
    storeInCache,
  };
}
