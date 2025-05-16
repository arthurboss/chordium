import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { formatSearchQuery } from "@/utils/search-utils";
import { SearchResultItem } from "@/utils/search-result-item";

export function useSearchResults() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      const params = searchParams;
      const { query: actualQuery, searchType: actualSearchType } = formatSearchQuery(params);
      if (!actualQuery) {
        setResults([]);
        setLoading(false);
        return;
      }
      try {
        let backendUrl = `http://localhost:3001/api/cifraclub-search?q=${encodeURIComponent(actualQuery)}`;
        if (actualSearchType) backendUrl += `&searchType=${actualSearchType}`;
        const res = await axios.get<SearchResultItem[]>(backendUrl);
        console.log(`Search results: Found ${res.data.length} items`);
        console.log('Response data:', res.data);
        setResults(res.data);
      } catch (err) {
        console.error('SearchResults: backend search failed', err);
        console.error('Error details:', err.response?.data || err.message);
        setError("Failed to fetch search results. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [searchParams]);

  return { results, loading, error, searchParams };
}
