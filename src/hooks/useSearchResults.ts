import { useState, useEffect, useRef, useMemo } from "react";
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
  const lastFetchedSong = useRef<string>("");
  const lastSearchParams = useRef({ artist: '', song: '' });
  // Track if we should continue to fetch (this will reset after a successful fetch)
  const [shouldContinueFetching, setShouldContinueFetching] = useState(shouldFetch);



  // Update internal fetch tracking when prop changes
  useEffect(() => {
    console.log('[useSearchResults] shouldFetch:', shouldFetch, 'artist:', artist, 'song:', song);
    setShouldContinueFetching(shouldFetch);
    if (shouldFetch && (artist || song)) {
      // Reset all results and loading state on new search
      setArtists([]);
      setAllArtists([]);
      setSongs([]);
      setAllSongs([]);
      setLoading(true);
      setError(null);
      setHasFetched(false);
      lastFetchedArtist.current = "";
      lastFetchedSong.current = "";
    }
  }, [shouldFetch, artist, song]);

  // Only trigger fetch if artist or song input changes, not filterSong
  const shouldTriggerFetch = useMemo(() => {
    const shouldTrigger = shouldFetch && (artist !== lastSearchParams.current.artist || song !== lastSearchParams.current.song);
    console.log('[useSearchResults] shouldTriggerFetch calculation:', {
      shouldFetch,
      artist,
      song,
      lastArtist: lastSearchParams.current.artist,
      lastSong: lastSearchParams.current.song,
      shouldTrigger
    });
    return shouldTrigger;
  }, [artist, song, shouldFetch]);

  // Fetch artists or songs from backend when shouldFetch is true
  useEffect(() => {
    console.log('[useSearchResults] Fetch effect triggered. shouldContinueFetching:', shouldContinueFetching, 'artist:', artist, 'song:', song);
    console.log('[useSearchResults] lastFetchedArtist.current:', lastFetchedArtist.current, 'artist+song:', artist + '|' + song);
    console.log('[useSearchResults] shouldTriggerFetch:', shouldTriggerFetch);
    if (!shouldContinueFetching) {
      console.log('[useSearchResults] Early return: shouldContinueFetching is false');
      return;
    }
    if (!shouldTriggerFetch) {
      console.log('[useSearchResults] Early return: shouldTriggerFetch is false');
      return;
    }
    if (!artist && !song) {
      console.log('[useSearchResults] Early return: no artist or song');
      return;
    }

    // Check cache first
    const cachedResults = getCachedSearchResults(artist, song);
    if (cachedResults && cachedResults.length > 0) {
      console.log('[useSearchResults] Using cached results:', cachedResults.length);
      // Determine if cached results are artists or songs based on search type
      const isArtistSearch = artist && !song;
      const isSongSearch = !artist && song;
      
      if (isArtistSearch) {
        // Cached results are artists
        setArtists(cachedResults as unknown as Artist[]);
        setAllArtists(cachedResults as unknown as Artist[]);
        setSongs([]);
        setAllSongs([]);
      } else {
        // Cached results are songs
        setSongs(cachedResults as unknown as Song[]);
        setAllSongs(cachedResults as unknown as Song[]);
        setArtists([]);
        setAllArtists([]);
      }
      setLoading(false);
      setError(null);
      setHasFetched(true);
      lastSearchParams.current = { artist, song };
      return; // Don't fetch from API
    }

    setLoading(true);
    setError(null);
    let isArtistSearch = false;
    if (!artist && song) {
      // Song only search
      const url = `/api/cifraclub-search?artist=&song=${encodeURIComponent(song)}`;
      isArtistSearch = false;
      fetch(url)
        .then(async res => {
          if (!res.ok) throw new Error(`Failed to fetch search results: ${res.status}`);
          const text = await res.text();
          const data = text ? JSON.parse(text) : [];
          setSongs(data);
          setAllSongs(data); // <-- Store all fetched songs for local filtering
          setArtists([]);
          cacheSearchResults(artist, song, data);
          setLoading(false);
          lastSearchParams.current = { artist, song };
          setHasFetched(true);
        })
        .catch(err => {
          setError(err);
          setSongs([]);
          setArtists([]);
          setLoading(false);
          lastSearchParams.current = { artist, song };
          setHasFetched(true);
        });
    } else if (artist || song) {
      // Artist only or artist+song search
      const url = `/api/artists?artist=${encodeURIComponent(artist)}&song=${encodeURIComponent(song)}`;
      isArtistSearch = true;
      fetch(url)
        .then(async res => {
          if (!res.ok) throw new Error(`Failed to fetch search results: ${res.status}`);
          const text = await res.text();
          const data = text ? JSON.parse(text) : [];
          setArtists(data);
          setAllArtists(data); // <-- Store all fetched artists for local filtering
          setSongs([]);
          cacheSearchResults(artist, song, data);
          setLoading(false);
          lastSearchParams.current = { artist, song };
          setHasFetched(true);
        })
        .catch(err => {
          setError(err);
          setSongs([]);
          setArtists([]);
          setLoading(false);
          lastSearchParams.current = { artist, song };
          setHasFetched(true);
        });
    }
  }, [shouldTriggerFetch, artist, song, shouldFetch, shouldContinueFetching]);

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
    if (!shouldFetch) setLoading(false);
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
  }, [filterSong, allSongs, hasFetched, shouldFetch]);

  // Ensure loading is false when filterSong changes and shouldFetch is false
  useEffect(() => {
    if (!shouldFetch) {
      setLoading(false);
    }
  }, [filterSong, shouldFetch]);

  return {
    artists,
    songs,
    loading,
    error
  };
}
