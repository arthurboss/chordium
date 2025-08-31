import { useEffect, useRef } from "react";

export function useInitSearchStateEffect(
  location: { search: string; pathname: string },
  isInitialized: React.MutableRefObject<boolean>,
  setArtistInput: (artist: string) => void,
  setSongInput: (song: string) => void,
  setPrevArtistInput: (artist: string) => void,
  setPrevSongInput: (song: string) => void,
  setSubmittedArtist: (artist: string) => void,
  setSubmittedSong: (song: string) => void,
  setOriginalSearchArtist: (artist: string | null) => void,
  setOriginalSearchSong: (song: string | null) => void,
  updateSearchState: (state: { artist: string; song: string; results: any[] }) => void,
  setHasSearched: (val: boolean) => void,
  setShouldFetch: (val: boolean) => void
) {
  const lastProcessedParams = useRef<string>('');

  useEffect(() => {
    // Reset initialization flag when pathname changes to allow re-initialization
    // This is needed when switching back to the search tab from other tabs
    console.log('🔄 useInitSearchStateEffect: resetting initialization flag for pathname:', location.pathname);
    isInitialized.current = false;
    lastProcessedParams.current = '';
  }, [location.pathname]);

  useEffect(() => {
    console.log('🔄 useInitSearchStateEffect: checking pathname:', location.pathname);
    // Only process search parameters when we're actually on the search page
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
        // Always restore the raw value from the URL
        const artist = artistParam || '';
        const song = songParam || '';
        // Create a key to track what we've processed
        const currentParamsKey = `${artistParam || ''}|${songParam || ''}`;
        // Only process if we haven't processed these exact parameters before
        if (currentParamsKey !== lastProcessedParams.current && !isInitialized.current) {
          console.log('🔄 useInitSearchStateEffect: initializing search state from URL params');
          setArtistInput(artist);
          setSongInput(song);
          setPrevArtistInput(artist);
          setPrevSongInput(song);
          setSubmittedArtist(artist);
          setSubmittedSong(song);
          // Preserve the original search query for navigation back
          setOriginalSearchArtist(artist);
          setOriginalSearchSong(song);
          updateSearchState({ artist, song, results: [] });
          setHasSearched(true);
          setShouldFetch(true);
          isInitialized.current = true;
          lastProcessedParams.current = currentParamsKey;
        } else {
          console.log('🔄 useInitSearchStateEffect: skipping initialization - already processed or initialized');
        }
      } else {
        // Reset when no search params
        console.log('🔄 useInitSearchStateEffect: no search params, resetting');
        isInitialized.current = false;
        lastProcessedParams.current = '';
      }
    } else {
      console.log('🔄 useInitSearchStateEffect: not on search page, skipping');
    }
  }, [location.search, location.pathname, updateSearchState]);
}
