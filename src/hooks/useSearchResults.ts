import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { SearchResultItem } from "@/utils/search-result-item";
import { 
  getCachedSearchResults, 
  cacheSearchResults, 
  setLastSearchQuery,
  clearExpiredSearchCache
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
  
  // Clear expired cache entries when component mounts
  useEffect(() => {
    clearExpiredSearchCache();
  }, []);

  useEffect(() => {
    const paramsString = JSON.stringify({ artistParam, songParam });

    // Deduplicate: skip if params haven't changed
    if (lastRequestParams.current === paramsString) return;

    // Debounce: clear previous timeout
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      lastRequestParams.current = paramsString;

      if (!artistParam && !songParam) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      // Store last query in cache
      setLastSearchQuery(artistParam, songParam);
      
      // Check if we have cached results
      const cachedResults = getCachedSearchResults(artistParam, songParam);
      if (cachedResults) {
        console.log('Using cached search results');
        setResults(cachedResults);
        setLoading(false);
        setError(null);
        return;
      }

      const backendUrlParams = new URLSearchParams();
      if (artistParam) backendUrlParams.append('artist', artistParam);
      if (songParam) backendUrlParams.append('song', songParam);
      const backendUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/cifraclub-search?${backendUrlParams.toString()}`;

      setLoading(true);
      setError(null);

      axios.get<SearchResultItem[]>(backendUrl)
        .then(res => {
          setResults(res.data);
          // Cache the results
          cacheSearchResults(artistParam, songParam, res.data);
        })
        .catch(() => setError("Failed to fetch search results. Please try again."))
        .finally(() => setLoading(false));
    }, 250); // 250ms debounce

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [artistParam, songParam]);

  return { results, loading, error, searchParams };
}
