// filepath: /Users/arthurboss/projects/chordium/src/hooks/useSearchResults.ts
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { SearchResultItem } from "@/utils/search-result-item";

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

      const backendUrlParams = new URLSearchParams();
      if (artistParam) backendUrlParams.append('artist', artistParam);
      if (songParam) backendUrlParams.append('song', songParam);
      const backendUrl = `http://localhost:3001/api/cifraclub-search?${backendUrlParams.toString()}`;

      setLoading(true);
      setError(null);

      axios.get<SearchResultItem[]>(backendUrl)
        .then(res => setResults(res.data))
        .catch(() => setError("Failed to fetch search results. Please try again."))
        .finally(() => setLoading(false));
    }, 250); // 250ms debounce

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [artistParam, songParam]);

  return { results, loading, error, searchParams };
}
