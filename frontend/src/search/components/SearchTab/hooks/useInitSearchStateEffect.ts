import { useEffect, useRef } from "react";
import { fromSlug } from "@/utils/url-slug-utils";
import type { Artist } from "@chordium/types";

interface InitSearchStateOptions {
  location: { search: string; pathname: string };
  isInitialized: React.MutableRefObject<boolean>;
  setArtistInput: (artist: string) => void;
  setSongInput: (song: string) => void;
  setPrevArtistInput: (artist: string) => void;
  setPrevSongInput: (song: string) => void;
  setSubmittedArtist: (artist: string) => void;
  setSubmittedSong: (song: string) => void;
  setOriginalSearchArtist: (artist: string | null) => void;
  setOriginalSearchSong: (song: string | null) => void;
  updateSearchStateWithOriginal: (state: { artist: string; song: string; results: unknown[] }) => void;
  setHasSearched: (val: boolean) => void;
  setShouldFetch: (val: boolean) => void;
  setActiveArtist: (artist: Artist) => void;
  isOnArtistPage: () => boolean;
  getCurrentArtistPath: () => string | null;
}

export function useInitSearchStateEffect(options: InitSearchStateOptions) {
  const {
    location,
    isInitialized,
    setArtistInput,
    setSongInput,
    setPrevArtistInput,
    setPrevSongInput,
    setSubmittedArtist,
    setSubmittedSong,
    setOriginalSearchArtist,
    setOriginalSearchSong,
    updateSearchStateWithOriginal,
    setHasSearched,
    setShouldFetch,
    setActiveArtist,
    isOnArtistPage,
    getCurrentArtistPath
  } = options;

  const lastProcessedParams = useRef<string>('');

  useEffect(() => {
    // Reset initialization flag when pathname changes to allow re-initialization
    // This is needed when switching back to the search tab from other tabs
    console.log('🔄 useInitSearchStateEffect: resetting initialization flag for pathname:', location.pathname);
    isInitialized.current = false;
    lastProcessedParams.current = '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    console.log('🔄 useInitSearchStateEffect: checking route:', {
      pathname: location.pathname,
      isOnArtistPage: isOnArtistPage(),
      isInitialized: isInitialized.current
    });

    // Handle /search route with query parameters
    if (location.pathname === '/search') {
      const searchParams = new URLSearchParams(location.search);
      const artistParam = searchParams.get('artist');
      const songParam = searchParams.get('song');
      
      console.log('🔄 useInitSearchStateEffect: search params found:', {
        artistParam,
        songParam,
        isInitialized: isInitialized.current
      });
      
      if (artistParam || songParam) {
        // Only initialize if we haven't already processed these parameters
        // This prevents overwriting an existing search query
        const currentParamsKey = `${artistParam || ''}|${songParam || ''}`;
        if (currentParamsKey !== lastProcessedParams.current && !isInitialized.current) {
          console.log('🔄 useInitSearchStateEffect: initializing search state from URL params');
          setArtistInput(artistParam || '');
          setSongInput(songParam || '');
          setPrevArtistInput(artistParam || '');
          setPrevSongInput(songParam || '');
          setSubmittedArtist(artistParam || '');
          setSubmittedSong(songParam || '');
          // Preserve the original search query for navigation back
          setOriginalSearchArtist(artistParam);
          setOriginalSearchSong(songParam);
          updateSearchStateWithOriginal({ artist: artistParam || '', song: songParam || '', results: [] });
          setHasSearched(true);
          setShouldFetch(true);
          isInitialized.current = true;
          lastProcessedParams.current = currentParamsKey;
        } else {
          console.log('🔄 useInitSearchStateEffect: skipping initialization - already processed or initialized');
        }
      } else {
        // No search params - don't reset if we have an existing search query
        console.log('🔄 useInitSearchStateEffect: no search params');
        if (!isInitialized.current) {
          isInitialized.current = true;
        }
        lastProcessedParams.current = '';
      }
    }
    // Handle /:artist route
    else if (isOnArtistPage() && !isInitialized.current) {
      const artistPath = getCurrentArtistPath();
      console.log('🔄 useInitSearchStateEffect: artist path found:', artistPath);
      
      if (artistPath) {
        const artistName = fromSlug(artistPath);
        console.log('🔄 useInitSearchStateEffect: initializing artist page for:', artistName);
        
        setActiveArtist({
          displayName: artistName,
          path: artistPath,
          songCount: null,
        });
        
        // IMPORTANT: Restore the original search query from session storage
        // This ensures the input fields show the original search query
        try {
          const storedQuery = sessionStorage.getItem('chordium_search_query');
          if (storedQuery) {
            const { artist, song } = JSON.parse(storedQuery);
            if (artist || song) {
              console.log('🔄 useInitSearchStateEffect: restoring search query from session storage:', { artist, song });
              setArtistInput(artist || '');
              setSongInput(song || '');
              setPrevArtistInput(artist || '');
              setPrevSongInput(song || '');
              setSubmittedArtist(artist || '');
              setSubmittedSong(song || '');
              setOriginalSearchArtist(artist || '');
              setOriginalSearchSong(song || '');
              setHasSearched(true);
            }
          }
        } catch (error) {
          console.warn('Failed to restore search query from session storage:', error);
        }
        
        // Don't set submittedArtist here - preserve the original search query
        // This allows the back button to return to the original search results
        setHasSearched(true);
        
        // Note: Don't set setShouldFetch(true) here because that would trigger
        // an artist search instead of artist songs fetching.
        // The activeArtist effect in useSearchReducer will handle songs fetching.
        isInitialized.current = true;
        console.log('🔄 useInitSearchStateEffect: artist page initialized successfully');
      } else {
        console.log('🔄 useInitSearchStateEffect: no artist path found');
      }
    } else {
      console.log('🔄 useInitSearchStateEffect: not on search or artist page, or already initialized');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, location.pathname, updateSearchStateWithOriginal, isOnArtistPage, getCurrentArtistPath]);
}
