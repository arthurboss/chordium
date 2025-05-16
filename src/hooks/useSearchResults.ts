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
  const lastRequestRef = useRef<string | null>(null);

  // Extract artist and song strings for the dependency array
  const artistParam = searchParams.get('artist');
  const songParam = searchParams.get('song');

  useEffect(() => {
    const fetchResults = async () => {
      // setLoading(true) and setError(null) moved down
      
      if (!artistParam && !songParam) {
        setResults([]);
        setLoading(false);
        setError(null); // Ensure error is cleared
        lastRequestRef.current = null;
        return;
      }
      
      // Simplified formatParam
      const formatParam = (param: string) => param.toLowerCase().replace(/\s+/g, "-");
      const formattedArtist = artistParam ? formatParam(artistParam) : null;
      const formattedSong = songParam ? formatParam(songParam) : null;
      
      const backendUrlParams = new URLSearchParams();
      if (formattedArtist) backendUrlParams.append('artist', formattedArtist);
      if (formattedSong) backendUrlParams.append('song', formattedSong);
      
      const backendUrl = `http://localhost:3001/api/cifraclub-search?${backendUrlParams.toString()}`;
      
      // If the generated URL is the same as the last one, do nothing.
      // The previous request will handle the loading state.
      if (backendUrl === lastRequestRef.current) {
        console.log('Skipping request: URL is identical to the last processed request.', backendUrl);
        // Ensure setLoading(false) is NOT called here if a request is in flight or already handled.
        return;
      }
      
      // This is a new, distinct request.
      setLoading(true);
      setError(null);
      lastRequestRef.current = backendUrl; // Store this new request URL
      
      try {
        console.log(`Making search request to: ${backendUrl}`);
        const res = await axios.get<SearchResultItem[]>(backendUrl);
        console.log(`Search results: Found ${res.data.length} items`);

        // Only update state if this response is for the current request
        if (lastRequestRef.current === backendUrl) {
          setResults(res.data);
        } else {
          console.log("Response for a stale request received, ignoring results for:", backendUrl);
        }
      } catch (err) {
        console.error('SearchResults: backend search failed', err);
        // Ensure err.response or err.message is logged for better diagnostics
        if (err.response) {
          console.error('Error response data:', err.response.data);
          console.error('Error response status:', err.response.status);
        } else {
          console.error('Error message:', err.message);
        }
        // Only update state if this error is for the current request
        if (lastRequestRef.current === backendUrl) {
          setError("Failed to fetch search results. Please try again.");
          setResults([]); 
        } else {
          console.log("Error for a stale request received, ignoring error for:", backendUrl);
        }
      } finally {
        // Only set loading to false if this finally block is for the current request
        if (lastRequestRef.current === backendUrl) {
          setLoading(false);
        } else {
          console.log("Finally block for a stale request, not changing loading state for:", backendUrl);
        }
      }
    };
    
    fetchResults();
  }, [artistParam, songParam]); // Use stable string dependencies

  return { results, loading, error, searchParams };
}
