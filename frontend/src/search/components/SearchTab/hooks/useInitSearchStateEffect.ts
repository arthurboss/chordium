import { useEffect, useRef } from "react";
import { fromSlug } from "@/utils/url-slug-utils";

export function useInitSearchStateEffect(
  location: { search: string; pathname: string },
  isInitialized: React.MutableRefObject<boolean>,
  setArtistInput: (artist: string) => void,
  setSongInput: (song: string) => void,
  setPrevArtistInput: (artist: string) => void,
  setPrevSongInput: (song: string) => void,
  setSubmittedArtist: (artist: string) => void,
  setSubmittedSong: (song: string) => void,
  updateSearchState: (state: { artist: string; song: string; results: any[] }) => void,
  setHasSearched: (val: boolean) => void,
  setShouldFetch: (val: boolean) => void
) {
  const lastProcessedParams = useRef<string>('');
  
  useEffect(() => {
    // Only process search parameters when we're actually on the search page
    if (location.pathname !== '/search') {
      return;
    }
    
    const searchParams = new URLSearchParams(location.search);
    const artistParam = searchParams.get('artist');
    const songParam = searchParams.get('song');
    
    if (artistParam || songParam) {
      const artist = artistParam ? fromSlug(artistParam) : '';
      const song = songParam ? fromSlug(songParam) : '';
      
      // Create a key to track what we've processed
      const currentParamsKey = `${artistParam || ''}|${songParam || ''}`;
      
      // Only process if we haven't processed these exact parameters before
      if (currentParamsKey !== lastProcessedParams.current) {
        
        setArtistInput(artist);
        setSongInput(song);
        setPrevArtistInput(artist);
        setPrevSongInput(song);
        setSubmittedArtist(artist);
        setSubmittedSong(song);
        updateSearchState({ artist, song, results: [] });
        setHasSearched(true);
        setShouldFetch(true);
        isInitialized.current = true;
        lastProcessedParams.current = currentParamsKey;
      }
    } else {
      // Reset when no search params
      isInitialized.current = false;
      lastProcessedParams.current = '';
    }
  }, [location.search, location.pathname, updateSearchState]);
}
