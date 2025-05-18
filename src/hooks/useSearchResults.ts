import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { SearchResultItem } from "@/utils/search-result-item";
import { 
  getCachedSearchResults, 
  cacheSearchResults, 
  setLastSearchQuery,
  clearExpiredSearchCache,
  getSearchResultsWithRefresh
} from "@/utils/search-cache-utils";

export function useSearchResults() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const lastRequestParams = useRef<string | null>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Extract artist and song strings for the dependency array
  const artistParam = searchParams.get('artist');
  const songParam = searchParams.get('song');
  
  // Log search params for debugging
  useEffect(() => {
    console.log('Search params changed:', { artist: artistParam, song: songParam });
  }, [artistParam, songParam]);
  
  // Clear expired cache entries when component mounts
  useEffect(() => {
    clearExpiredSearchCache();
  }, []);

  useEffect(() => {
    // Create a unique identifier for this search session
    const searchId = `search-${Date.now()}`;
    console.log(`[${searchId}] Search effect running with params:`, { artistParam, songParam });

    const paramsString = JSON.stringify({ artistParam, songParam });

    // Skip if params haven't changed to avoid unnecessary API calls
    if (lastRequestParams.current === paramsString) {
      console.log(`[${searchId}] Skipping search - params haven't changed`);
      return;
    }

    // Always update lastRequestParams
    lastRequestParams.current = paramsString;

    // Debounce: clear previous timeout
    if (debounceTimeout.current) {
      console.log(`[${searchId}] Clearing previous search timeout`);
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      // Clear debounce reference once executed
      debounceTimeout.current = null;

      if (!artistParam && !songParam) {
        console.log(`[${searchId}] No search parameters provided, clearing results`);
        setResults([]);
        setLoading(false); // Ensure loading is set to false after results update
        setError(null);
        return;
      }

      // Store last query in cache
      console.log(`[${searchId}] Storing last search query:`, { artistParam, songParam });
      setLastSearchQuery(artistParam, songParam);

      // Set loading state
      setLoading(true);
      setError(null);

      console.log(`[${searchId}] Starting search for:`, { artistParam, songParam });

      // Log before calling getSearchResultsWithRefresh
      console.log(`[${searchId}] Calling getSearchResultsWithRefresh with:`, { artistParam, songParam });

      // Define a callback for when background refresh completes
      const refreshCallback = (newResults: SearchResultItem[]) => {
        console.log(`[${searchId}] Background refresh completed with results:`, newResults?.length, newResults);

        // Check if this is still the current search before updating state
        if (lastRequestParams.current === paramsString) {
          console.log(`[${searchId}] Updating results from background refresh`);
          setResults(prevResults => {
            const newResultsArray = newResults ? [...newResults] : []; // Ensure it's a new array
            if (prevResults.length === newResultsArray.length && 
                JSON.stringify(prevResults) === JSON.stringify(newResultsArray)) {
              console.log(`[${searchId}] Results from refreshCallback match previous results, forcing state update with new reference`);
              return newResultsArray; 
            }
            console.log(`[${searchId}] Updating with new distinct results from refreshCallback.`);
            return newResultsArray;
          });
          setLoading(false); // Ensure loading is set to false after results update
        } else {
          console.log(`[${searchId}] Background refresh completed but search params changed, ignoring results`);
        }
      };

      // Use the conditional refresh functionality
      getSearchResultsWithRefresh(artistParam, songParam, refreshCallback)
        .then(({ immediate, refreshPromise }) => {
          console.log(`[${searchId}] getSearchResultsWithRefresh resolved. Immediate:`, immediate, 'RefreshPromise:', refreshPromise);
          if (immediate) {
            // We have cached results, display them immediately
            console.log(`[${searchId}] Showing cached search results, count:`, immediate.length, immediate);

            if (lastRequestParams.current === paramsString) {
              Promise.resolve().then(() => {
                console.log(`[${searchId}] Microtask: Setting results and loading for immediate cache. Count:`, immediate?.length, immediate);
                // Ensure a new array reference is always set.
                // If 'immediate' is null (e.g. cache miss), set to empty array.
                setResults(immediate ? [...immediate] : []); 
                setLoading(false); 
              });
            } else {
              console.log(`[${searchId}] Search params changed during cache lookup, abandoning results`);
              return;
            }
            
            // Wait for potential background refresh to complete (handled by refreshCallback)
            refreshPromise.catch(error => {
              console.error(`[${searchId}] Background refresh failed silently:`, error);
            });
          } else {
            // No cached results. refreshPromise is for the initial fetch.
            // The refreshCallback (defined above) will be called by getSearchResultsWithRefresh
            // with the data, and it will call setResults and setLoading(false).
            console.log(`[${searchId}] No cached data available, initial fetch will trigger refreshCallback.`);
            refreshPromise
              .then(freshResultsFromPromise => {
                console.log(`[${searchId}] Initial fetch promise also resolved (data likely already handled by callback). Count:`, freshResultsFromPromise?.length);
                // The refreshCallback should have already handled setting loading to false.
              })
              .catch(err => {
                console.error(`[${searchId}] Error in initial fetch promise:`, err);
                if (lastRequestParams.current === paramsString) {
                  setError("Failed to fetch search results. Please try again.");
                  setLoading(false); // Ensure loading is false on error
                }
              });
          }
        })
        .catch(err => {
          console.error(`[${searchId}] getSearchResultsWithRefresh threw error:`, err);
          // Ensure loading and error states are set if getSearchResultsWithRefresh itself fails
          if (lastRequestParams.current === paramsString) {
            setError("Failed to initiate search. Please try again.");
            setLoading(false);
          }
        });
    }, 250); // 250ms debounce

    // Cleanup function that runs when component unmounts or effect re-runs
    return () => {
      console.log(`[${searchId}] Cleaning up search effect`);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [artistParam, songParam]);

  // Log hook's return values
  console.log(`[useSearchResults hook] Returning: loading=${loading}, resultsCount=${results?.length}, error=${error}, paramsChanged=${artistParam !== searchParams.get('artist') || songParam !== searchParams.get('song')}`);

  return { results, loading, error, searchParams };
}
