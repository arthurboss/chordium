import { useState, useEffect, useRef } from "react";
import { Artist } from "@/types/artist";
import { filterArtistsByNameOrPath } from "@/utils/artist-filter-utils";

/**
 * Custom hook to handle search results fetching and filtering
 * 
 * @param artist - The artist search term
 * @param song - The song search term
 * @param filterArtist - The filter string for artists (used for local filtering only)
 * @param filterSong - The filter string for songs (used for local filtering only)
 * @param shouldFetch - Boolean flag that controls when to fetch from API. 
 *                      Only fetch when this is true (e.g., when form is submitted)
 */
export function useSearchResults(
  artist: string, 
  song: string, 
  filterArtist: string, 
  filterSong: string, 
  shouldFetch: boolean = false
) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [allArtists, setAllArtists] = useState<Artist[]>([]); // Store all fetched artists
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const lastFetchedArtist = useRef<string>("");
  // Track if we should continue to fetch (this will reset after a successful fetch)
  const [shouldContinueFetching, setShouldContinueFetching] = useState(shouldFetch);



  // Update internal fetch tracking when prop changes
  useEffect(() => {
    setShouldContinueFetching(shouldFetch);
  }, [shouldFetch]);

  // Fetch artists from backend only when shouldFetch is true and it's a new artist
  useEffect(() => {
    // Skip fetch if shouldContinueFetching is false
    if (!shouldContinueFetching) {
      return;
    }
    
    // Only fetch if we have not fetched for this artist before or if it's a new search
    if (
      artist &&
      !loading &&
      lastFetchedArtist.current !== artist &&
      artist.trim() !== ""
    ) {
      setLoading(true);
      setError(null);
      fetch(`/api/artists?artist=${encodeURIComponent(artist)}`)
        .then(async res => {
          if (!res.ok) throw new Error(`Failed to fetch artists: ${res.status}`);
          
          const contentType = res.headers.get('content-type');
          
          const text = await res.text();
          
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Invalid response from backend (not JSON)');
          }
          
          const data = JSON.parse(text);
          return data;
        })
        .then((data: Artist[]) => {
          setAllArtists(data);
          setArtists(data);
          setLoading(false);
          setHasFetched(true);
          lastFetchedArtist.current = artist;
          // Reset shouldContinueFetching after successful fetch
          setShouldContinueFetching(false);
        })
        .catch(err => {
          setError(err instanceof Error ? err : new Error('Failed to fetch artists'));
          setLoading(false);
        });
    }
  }, [artist, loading, shouldContinueFetching]);

  // Only allow local filtering if we have a valid response
  useEffect(() => {
    if (hasFetched && allArtists.length > 0) {
      if (!filterArtist) {
        setArtists(allArtists);
      } else {
        // Use the dedicated artist filtering utility
        const filtered = filterArtistsByNameOrPath(allArtists, filterArtist);
        setArtists(filtered);
      }
    }
  }, [filterArtist, allArtists, hasFetched]);

  return {
    artists,
    songs: [], // No songs for now
    loading,
    error
  };
}
