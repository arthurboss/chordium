import { useEffect } from "react";
import { fromSlug } from "@/utils/url-slug-utils";
import type { Artist } from "@chordium/types";

export function useInitArtistPageEffect(
  location: { pathname: string },
  isOnArtistPage: () => boolean,
  getCurrentArtistPath: () => string | null,
  isInitialized: React.MutableRefObject<boolean>,
  setActiveArtist: (artist: Artist) => void,
  setArtistInput: (artist: string) => void,
  setPrevArtistInput: (artist: string) => void,
  setSubmittedArtist: (artist: string) => void,
  setHasSearched: (val: boolean) => void
) {
  useEffect(() => {
    // Reset initialization flag when pathname changes to allow re-initialization
    // This is needed when switching back to the search tab from other tabs
    console.log('🔄 useInitArtistPageEffect: resetting initialization flag for pathname:', location.pathname);
    isInitialized.current = false;
  }, [location.pathname]);

  useEffect(() => {
    console.log('🔄 useInitArtistPageEffect: checking artist page:', {
      pathname: location.pathname,
      isOnArtistPage: isOnArtistPage(),
      isInitialized: isInitialized.current
    });
    
    if (isOnArtistPage() && !isInitialized.current) {
      const artistPath = getCurrentArtistPath();
      console.log('🔄 useInitArtistPageEffect: artist path found:', artistPath);
      
      if (artistPath) {
        const artistName = fromSlug(artistPath);
        console.log('🔄 useInitArtistPageEffect: initializing artist page for:', artistName);
        
        setActiveArtist({
          displayName: artistName,
          path: artistPath,
          songCount: null,
        });
        
        // Set the input field to show the artist name for display purposes
        // but don't overwrite the submitted search state
        setArtistInput(artistName);
        setPrevArtistInput(artistName);
        
        // Don't set submittedArtist here - preserve the original search query
        // This allows the back button to return to the original search results
        setHasSearched(true);
        
        // Note: Don't set setShouldFetch(true) here because that would trigger
        // an artist search instead of artist songs fetching.
        // The activeArtist effect in useSearchReducer will handle songs fetching.
        isInitialized.current = true;
        console.log('🔄 useInitArtistPageEffect: artist page initialized successfully');
      } else {
        console.log('🔄 useInitArtistPageEffect: no artist path found');
      }
    } else {
      console.log('🔄 useInitArtistPageEffect: not on artist page or already initialized');
    }
  }, [location.pathname, isOnArtistPage, getCurrentArtistPath]);
}
