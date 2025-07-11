import { useState, useEffect, useRef } from "react";
import { Artist } from "@/types/artist";
import { Song } from "@/types/song";
import { filterArtistsByNameOrPath } from "@/utils/artist-filter-utils";
import { cacheSearchResults, getCachedSearchResults } from "@/cache/implementations/search-cache";
import { isAccentInsensitiveMatch } from "@/utils/accent-insensitive-search";

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
  const [songs, setSongs] = useState<Song[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]); // Store all fetched songs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const lastFetchedArtist = useRef<string>("");
  // Track if we should continue to fetch (this will reset after a successful fetch)
  const [shouldContinueFetching, setShouldContinueFetching] = useState(shouldFetch);



  // Update internal fetch tracking when prop changes
  useEffect(() => {
    console.log('[useSearchResults] shouldFetch:', shouldFetch, 'artist:', artist, 'song:', song);
    setShouldContinueFetching(shouldFetch);
    if (shouldFetch) {
      // Reset all results and loading state on new search
      setArtists([]);
      setAllArtists([]);
      setSongs([]);
      setAllSongs([]);
      setLoading(true);
      setError(null);
      setHasFetched(false);
      lastFetchedArtist.current = "";
    }
  }, [shouldFetch, artist, song]);

  // Fetch artists or songs from backend when shouldFetch is true
  useEffect(() => {
    console.log('[useSearchResults] Fetch effect triggered. shouldContinueFetching:', shouldContinueFetching, 'artist:', artist, 'song:', song);
    console.log('[useSearchResults] lastFetchedArtist.current:', lastFetchedArtist.current, 'artist+song:', artist + '|' + song);
    if (!shouldContinueFetching) {
      return;
    }
    // Allow fetch if either artist or song is present
    const shouldTriggerFetch =
      (artist || song) &&
      (lastFetchedArtist.current !== artist + '|' + song) &&
      ((artist && artist.trim() !== '') || (song && song.trim() !== ''));
    console.log('[useSearchResults] shouldTriggerFetch:', shouldTriggerFetch);
    if (shouldTriggerFetch) {
      console.log('[useSearchResults] About to start fetch for:', { artist, song });
      setLoading(true);
      setError(null);
      setArtists([]);
      setAllArtists([]);
      setSongs([]);
      setAllSongs([]);
      setHasFetched(false);
      const cachedResults = getCachedSearchResults(artist || null, song || null);
      if (cachedResults) {
        console.log('🎯 SEARCH CACHE HIT: Using cached results:', cachedResults.length);
        // Always set loading/hasFetched, even for empty results
        if (Array.isArray(cachedResults) && cachedResults.length > 0) {
          if ((!artist && song) || cachedResults[0]?.title) {
            setAllSongs(cachedResults);
            setSongs(cachedResults);
            setAllArtists([]);
            setArtists([]);
          } else if (cachedResults[0]?.displayName || cachedResults[0]?.name) {
            setAllArtists(cachedResults as unknown as Artist[]);
            setArtists(cachedResults as unknown as Artist[]);
            setAllSongs([]);
            setSongs([]);
          }
        } else {
          setAllArtists([]);
          setArtists([]);
          setAllSongs([]);
          setSongs([]);
        }
        setLoading(false);
        setHasFetched(true);
        lastFetchedArtist.current = artist + '|' + song;
        setShouldContinueFetching(false);
        return;
      }

      // Choose endpoint based on search type
      let url;
      if (!artist && song) {
        // Song only search
        url = `/api/cifraclub-search?artist=&song=${encodeURIComponent(song)}`;
      } else {
        // Artist only or artist+song search
        url = `/api/artists?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(song)}`;
      }
      console.log('[useSearchResults] Fetching:', url);
      fetch(url)
        .then(async res => {
          if (!res.ok) throw new Error(`Failed to fetch search results: ${res.status}`);
          const contentType = res.headers.get('content-type');
          const text = await res.text();
          if (!contentType?.includes('application/json')) {
            throw new Error('Invalid response from backend (not JSON)');
          }
          const data = JSON.parse(text);
          return data;
        })
        .then((data) => {
          console.log('[useSearchResults] Response received:', data);
          // Cache the results
          console.log('💾 SEARCH CACHING: Saving search results for artist:', artist || 'null', 'song:', song || 'null');
          cacheSearchResults(artist || null, song || null, data);
          // Always set loading/hasFetched, even for empty results
          if (Array.isArray(data)) {
            if (data.length > 0) {
              if ((!artist && song) || data[0]?.title) {
                // Song-only search or song results
                setAllSongs(data);
                setSongs(data);
                setAllArtists([]);
                setArtists([]);
              } else if (data[0]?.displayName || data[0]?.name) {
                // Artist search or artist results
                setAllArtists(data);
                setArtists(data);
                setAllSongs([]);
                setSongs([]);
              }
            } else {
              // Empty array: no results for artist or song
              setAllArtists([]);
              setArtists([]);
              setAllSongs([]);
              setSongs([]);
            }
            setLoading(false);
            setHasFetched(true);
            lastFetchedArtist.current = artist + '|' + song;
            setShouldContinueFetching(false);
            console.log('[useSearchResults] Fetch effect completed for:', { artist, song });
            return;
          }
        })
        .catch(err => {
          setError(err instanceof Error ? err : new Error('Failed to fetch search results'));
          setLoading(false);
          setHasFetched(true); // Mark as fetched even on error to allow UI to show empty/error state
        });
    }
  }, [artist, song, shouldContinueFetching]);

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

  // Filter songs if we have song results
  useEffect(() => {
    console.log('[useSearchResults] Song filter effect:', { hasFetched, allSongsLength: allSongs.length, filterSong });
    if (hasFetched && allSongs.length > 0) {
      if (!filterSong) {
        console.log('[useSearchResults] Setting songs (no filter):', allSongs);
        setSongs(allSongs);
      } else {
        // Filter songs by title using accent-insensitive matching
        const filtered = allSongs.filter(song => 
          isAccentInsensitiveMatch(filterSong, song.title)
        );
        console.log('[useSearchResults] Setting filtered songs:', filtered);
        setSongs(filtered);
      }
    }
  }, [filterSong, allSongs, hasFetched]);

  return {
    artists,
    songs,
    loading,
    error
  };
}
