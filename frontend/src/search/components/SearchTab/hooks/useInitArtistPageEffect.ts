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
    if (isOnArtistPage() && !isInitialized.current) {
      const artistPath = getCurrentArtistPath();
      if (artistPath) {
        const artistName = fromSlug(artistPath);
        setActiveArtist({
          displayName: artistName,
          path: artistPath,
          songCount: null,
        });
        setArtistInput(artistName);
        setPrevArtistInput(artistName);
        setSubmittedArtist(artistName);
        setHasSearched(true);
        // Note: Don't set setShouldFetch(true) here because that would trigger
        // an artist search instead of artist songs fetching.
        // The activeArtist effect in useSearchReducer will handle songs fetching.
        isInitialized.current = true;
      }
    }
  }, [location.pathname, isOnArtistPage, getCurrentArtistPath]);
}
