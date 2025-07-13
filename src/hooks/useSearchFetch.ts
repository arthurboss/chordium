import { useState, useRef, useEffect, useCallback } from 'react';
import { Artist } from '../types/artist';
import { Song } from '../types/song';
import { cacheSearchResults, getCachedSearchResults } from '../cache/implementations/search-cache';

interface UseSearchFetchState {
  artists: Artist[] | null;
  songs: Song[] | null;
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
}

interface UseSearchFetchOptions {
  artist: string;
  song: string;
  shouldFetch: boolean;
}

export const useSearchFetch = ({ artist, song, shouldFetch }: UseSearchFetchOptions): UseSearchFetchState => {
  const [artists, setArtists] = useState<Artist[] | null>(null);
  const [songs, setSongs] = useState<Song[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  
  const lastFetchParams = useRef<{ artist: string; song: string }>({ artist: '', song: '' });
  const lastResults = useRef<{ artists: Artist[] | null; songs: Song[] | null }>({ artists: null, songs: null });
  const isFetching = useRef(false);

  console.log('[useSearchFetch] RENDER:', { artist, song, shouldFetch, loading, hasFetched });

  const fetchData = useCallback(async (artistParam: string, songParam: string) => {
    console.log('[useSearchFetch] FETCH START:', { artistParam, songParam, isFetching: isFetching.current });
    
    // Prevent concurrent fetches
    if (isFetching.current) {
      console.log('[useSearchFetch] FETCH BLOCKED - Already fetching');
      return;
    }
    isFetching.current = true;

    if (!artistParam && !songParam) {
      console.log('[useSearchFetch] EMPTY PARAMS - Clearing state');
      setArtists(null);
      setSongs(null);
      setLoading(false);
      setError(null);
      setHasFetched(true);
      isFetching.current = false;
      return;
    }

    try {
      console.log('[useSearchFetch] SETTING LOADING STATE');
      setLoading(true);
      setError(null);
      
      // Check cache first
      const cachedResults = getCachedSearchResults(artistParam, songParam);
      if (cachedResults !== null) {
        console.log('[useSearchFetch] CACHE HIT:', { resultsLength: cachedResults.length });
        if (artistParam) {
          // Artist search - cached results are Artist[]
          setArtists(cachedResults as unknown as Artist[]);
          setSongs(null);
          lastResults.current = { artists: cachedResults as unknown as Artist[], songs: null };
        } else if (songParam) {
          // Song only search - cached results are Song[]
          setSongs(cachedResults as unknown as Song[]);
          setArtists(null);
          lastResults.current = { artists: null, songs: cachedResults as unknown as Song[] };
        }
        setLoading(false);
        setError(null);
        setHasFetched(true);
        lastFetchParams.current = { artist: artistParam, song: songParam };
        isFetching.current = false;
        return;
      }
      
      console.log('[useSearchFetch] CACHE MISS - Making API call');
      
      // Make API call based on search type
      if (!artistParam && songParam) {
        // Song only search
        const url = `/api/cifraclub-search?artist=&song=${encodeURIComponent(songParam)}`;
        console.log('[useSearchFetch] SONG SEARCH:', url);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch search results: ${response.status}`);
        const text = await response.text();
        const data = text ? JSON.parse(text) : [];
        console.log('[useSearchFetch] SONG SEARCH RESULT:', { dataLength: data.length });
        setSongs(data);
        setArtists(null);
        cacheSearchResults(artistParam, songParam, data);
        lastResults.current = { artists: null, songs: data };
      } else if (artistParam || songParam) {
        // Artist only or artist+song search
        const url = `/api/artists?artist=${encodeURIComponent(artistParam)}&song=${encodeURIComponent(songParam)}`;
        console.log('[useSearchFetch] ARTIST SEARCH:', url);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch search results: ${response.status}`);
        const text = await response.text();
        const data = text ? JSON.parse(text) : [];
        console.log('[useSearchFetch] ARTIST SEARCH RESULT:', { dataLength: data.length });
        setArtists(data);
        setSongs(null);
        cacheSearchResults(artistParam, songParam, data);
        lastResults.current = { artists: data, songs: null };
      }
      
      console.log('[useSearchFetch] FETCH COMPLETE - Setting final state');
      setLoading(false);
      setError(null);
      setHasFetched(true);
      lastFetchParams.current = { artist: artistParam, song: songParam };
    } catch (err) {
      console.error('[useSearchFetch] FETCH ERROR:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch search results');
      setSongs(null);
      setArtists(null);
      setLoading(false);
      setHasFetched(true);
      lastFetchParams.current = { artist: artistParam, song: songParam };
    } finally {
      isFetching.current = false;
    }
  }, []); // Remove shouldFetch from dependencies to prevent recreation

  useEffect(() => {
    console.log('[useSearchFetch] EFFECT TRIGGERED:', { shouldFetch, artist, song });
    
    // Only trigger fetch when shouldFetch is true and search params have changed
    if (shouldFetch) {
      const searchParamsChanged =
        artist !== lastFetchParams.current.artist || song !== lastFetchParams.current.song;
      const shouldTriggerFetch = searchParamsChanged && (artist || song);
      
      console.log('[useSearchFetch] FETCH DECISION:', { 
        searchParamsChanged, 
        shouldTriggerFetch, 
        currentParams: { artist, song },
        lastParams: lastFetchParams.current
      });
      
      if (shouldTriggerFetch) {
        console.log('[useSearchFetch] TRIGGERING FETCH');
        fetchData(artist, song);
      }
    }
  }, [artist, song, shouldFetch, fetchData]);

  // On filter changes (shouldFetch: false), use lastResults for local filtering
  useEffect(() => {
    if (!shouldFetch && !loading) {
      console.log('[useSearchFetch] FILTER MODE - Using lastResults:', { 
        artists: lastResults.current.artists?.length, 
        songs: lastResults.current.songs?.length 
      });
      setArtists(lastResults.current.artists);
      setSongs(lastResults.current.songs);
    }
  }, [shouldFetch, loading]);

  console.log('[useSearchFetch] RETURNING STATE:', { 
    artists: artists?.length, 
    songs: songs?.length, 
    loading, 
    error, 
    hasFetched 
  });

  return {
    artists,
    songs,
    loading,
    error,
    hasFetched
  };
}; 