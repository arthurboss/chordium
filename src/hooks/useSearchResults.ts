import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { formatSearchQuery } from "@/utils/search-utils";
import { SearchResultItem } from "@/utils/search-result-item";

export function useSearchResults() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Use a ref to track the last request URL and prevent duplicates
  const lastRequestRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      
      // Get the artist and song directly from URL parameters
      const artist = searchParams.get('artist');
      const song = searchParams.get('song');
      
      // If no search parameters, don't make a request
      if (!artist && !song) {
        setResults([]);
        setLoading(false);
        return;
      }
      
      // Format the parameters consistently
      const formatParam = (param: string) => param?.toLowerCase().replace(/\s+/g, "-");
      const formattedArtist = artist ? formatParam(artist) : null;
      const formattedSong = song ? formatParam(song) : null;
      
      // Build the backend URL with the correct format
      const backendUrlParams = new URLSearchParams();
      if (formattedArtist) backendUrlParams.append('artist', formattedArtist);
      if (formattedSong) backendUrlParams.append('song', formattedSong);
      
      const backendUrl = `http://localhost:3001/api/cifraclub-search?${backendUrlParams.toString()}`;
      
      // Skip duplicate requests
      if (backendUrl === lastRequestRef.current) {
        console.log('Skipping duplicate request:', backendUrl);
        setLoading(false);
        return;
      }
      
      // Store this request URL to prevent duplicates
      lastRequestRef.current = backendUrl;
      
      try {
        console.log(`Making search request to: ${backendUrl}`);
        const res = await axios.get<SearchResultItem[]>(backendUrl);
        console.log(`Search results: Found ${res.data.length} items`);
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
