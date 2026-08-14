import { useCallback, useRef } from "react";
import type { SearchHit } from "@chordium/types";
import { searchCacheService } from "@/storage/services/search-cache/search-cache-service";

import { getApiBaseUrl } from "@/utils/api-base-url";
import { UseSearchFetchOptions } from "./useSearchFetch.types";
import { getNormalizedSearchCacheKey } from "@/search/utils/normalization/getNormalizedSearchCacheKey";

/**
 * Hook for handling search API requests with caching
 */
export const useSearchFetch = ({
  dispatch,
  onFetchComplete,
  setSearchFetching,
}: UseSearchFetchOptions) => {
  const isFetching = useRef(false);
  const lastQuery = useRef<string | null>(null);

  const fetchSearchResults = useCallback(
    async (query: string) => {
      if (isFetching.current) return;

      const trimmed = query.trim();
      if (trimmed === lastQuery.current) return;

      isFetching.current = true;
      setSearchFetching(true);
      lastQuery.current = trimmed;

      try {
        dispatch({ type: "SEARCH_START" });

        if (!trimmed) {
          dispatch({ type: "SEARCH_SUCCESS", hits: [] });
          if (onFetchComplete) onFetchComplete();
          return;
        }

        const cacheKey = getNormalizedSearchCacheKey(trimmed, "search");
        const cachedEntry = await searchCacheService.get(cacheKey);
        if (cachedEntry) {
          dispatch({ type: "SEARCH_SUCCESS", hits: cachedEntry.results as SearchHit[] });
          if (onFetchComplete) onFetchComplete();
          return;
        }

        const apiUrl = `${getApiBaseUrl()}/api/search?q=${encodeURIComponent(trimmed)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch search results: ${response.status}`);
        }
        const text = await response.text();
        const hits: SearchHit[] = text ? JSON.parse(text) : [];

        dispatch({ type: "SEARCH_SUCCESS", hits });

        // An empty result is not cached: it is as likely to mean the source was
        // having a bad moment as it is to mean there is nothing to find.
        if (hits.length > 0) {
          await searchCacheService.storeResults({
            searchKey: cacheKey,
            results: hits,
            search: {
              query: trimmed,
              kind: "search",
              dataSource: "cifraclub",
            },
          });
        }

        if (onFetchComplete) onFetchComplete();
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("[useSearchFetch] FETCH ERROR:", err);
        }
        const errorObj =
          err instanceof Error
            ? err
            : new Error("Failed to fetch search results");
        dispatch({ type: "SEARCH_ERROR", error: errorObj });
      } finally {
        setSearchFetching(false);
        isFetching.current = false;
      }
    },
    [dispatch, onFetchComplete, setSearchFetching]
  );

  return { fetchSearchResults };
};
