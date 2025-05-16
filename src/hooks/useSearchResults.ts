// filepath: /Users/arthurboss/projects/chordium/src/hooks/useSearchResults.ts
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { formatSearchQuery } from "@/utils/search-utils";
import { SearchResultItem } from "@/utils/search-result-item";
import { useSearchLoading } from "@/hooks/useSearchLoading";

// Create a request controller to handle duplicate requests
// This is a static variable outside the hook so it persists between renders
const pendingRequests = new Map<string, { controller: AbortController, promise: Promise<SearchResultItem[]> }>();

export function useSearchResults() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const lastRequestId = useRef(0);
  const lastAbortController = useRef<AbortController | null>(null);
  const { setSearchLoading } = useSearchLoading();

  // Extract artist and song strings for the dependency array
  const artistParam = searchParams.get('artist');
  const songParam = searchParams.get('song');

  // Sync the local loading state with the global context
  useEffect(() => {
    setSearchLoading(loading);
  }, [loading, setSearchLoading]);

  useEffect(() => {
    // Abort any previous request
    if (lastAbortController.current) {
      lastAbortController.current.abort();
    }
    const abortController = new AbortController();
    lastAbortController.current = abortController;
    const requestId = ++lastRequestId.current;

    const fetchResults = async () => {
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
      try {
        const res = await axios.get<SearchResultItem[]>(backendUrl, { signal: abortController.signal });
        if (!abortController.signal.aborted && lastRequestId.current === requestId) {
          setResults(res.data);
          setLoading(false);
        }
      } catch (err) {
        if (!abortController.signal.aborted && lastRequestId.current === requestId) {
          setError("Failed to fetch search results. Please try again.");
          setResults([]);
          setLoading(false);
        }
      }
    };
    fetchResults();
    return () => {
      abortController.abort();
    };
  }, [artistParam, songParam]);

  return { results, loading, error, searchParams };
}
