import { useState, useMemo, useEffect, useRef } from "react";
import { Artist } from "@/types/artist";
import { filterArtistsByNameOrPath } from "@/utils/artist-filter-utils";

export function useSearchResults(artist: string, song: string, filterArtist: string, filterSong: string) {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [allArtists, setAllArtists] = useState<Artist[]>([]); // Store all fetched artists
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const lastFetchedArtist = useRef<string>("");

  // Fetch artists from backend only on first search for a new artist
  useEffect(() => {
    // Only fetch if we have not fetched for this artist before
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
          console.log('Response object:', res);
          if (!res.ok) throw new Error('Failed to fetch artists');
          const contentType = res.headers.get('content-type');
          console.log('Content-Type:', contentType);
          const text = await res.text();
          console.log('Raw response text:', text);
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Invalid response from backend (not JSON)');
          }
          const data = JSON.parse(text);
          return data;
        })
        .then((data: Artist[]) => {
          console.log('Parsed JSON data:', data);
          setAllArtists(data);
          setArtists(data);
          setLoading(false);
          setHasFetched(true);
          lastFetchedArtist.current = artist;
        })
        .catch(err => {
          setError(err);
          setLoading(false);
        });
    }
  }, [artist, loading]);

  // Only allow local filtering if we have a valid response
  useEffect(() => {
    if (hasFetched && allArtists.length > 0) {
      if (!filterArtist) {
        setArtists(allArtists);
      } else {
        // Use the dedicated artist filtering utility
        setArtists(filterArtistsByNameOrPath(allArtists, filterArtist));
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
