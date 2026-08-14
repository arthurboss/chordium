import { useEffect, useRef } from "react";
import { fromSlug } from "@/utils/url-slug-utils";
import { ARTIST_DISPLAY_NAME_KEY } from "@/search/utils/navigation/navigateToArtist";
import { getStoredArtistDisplayName } from "@/search/utils/artist/artist-display-name-cache";
import { readQueryFromUrl, readStoredSearch } from "./storedSearch";
import type { Artist } from "@chordium/types";

interface InitSearchStateOptions {
  location: { search: string; pathname: string };
  isInitialized: React.MutableRefObject<boolean>;
  isClearing: boolean;
  setInput: (value: string) => void;
  setSubmittedQuery: (value: string) => void;
  setOriginalQuery: (value: string) => void;
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
    isClearing,
    setInput,
    setSubmittedQuery,
    setOriginalQuery,
    setHasSearched,
    setShouldFetch,
    setActiveArtist,
    isOnArtistPage,
    getCurrentArtistPath
  } = options;

  const lastProcessedQuery = useRef<string>('');

  useEffect(() => {
    // Reset initialization flag when pathname changes to allow re-initialization
    // This is needed when switching back to the search tab from other tabs
    isInitialized.current = false;
    lastProcessedQuery.current = '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (isClearing) return;

    // Handle /search route with a query parameter
    if (location.pathname === '/search') {
      const query = readQueryFromUrl(location.search);

      if (query) {
        // Only initialize once per query, so an existing search is not overwritten
        if (query !== lastProcessedQuery.current && !isInitialized.current) {
          setInput(query);
          setSubmittedQuery(query);
          setOriginalQuery(query);
          setHasSearched(true);
          setShouldFetch(true);
          isInitialized.current = true;
          lastProcessedQuery.current = query;
        }
      } else {
        // No query - don't reset if there is an existing search in progress
        isInitialized.current = true;
        lastProcessedQuery.current = '';
      }
      return;
    }

    // Handle /:artist route
    if (isOnArtistPage() && !isInitialized.current) {
      const artistPath = getCurrentArtistPath();
      if (!artistPath) return;

      // Prefer stored displayName (set when navigating from artist selection) over
      // fromSlug. Kept (not removed) so it survives repeated back-navigation to
      // this artist; it's keyed by path and overwritten when a different artist
      // is selected, so it can't go stale for the wrong artist.
      let artistName = fromSlug(artistPath);
      try {
        const stored = sessionStorage.getItem(ARTIST_DISPLAY_NAME_KEY);
        if (stored) {
          const { path: storedPath, displayName } = JSON.parse(stored);
          if (storedPath === artistPath && displayName) {
            artistName = displayName;
          }
        }
      } catch {}

      setActiveArtist({ displayName: artistName, path: artistPath, songCount: null });

      // The displayName exactly as returned by the search API (e.g.
      // "Florianópolis House Of Prayer (fhop music)") is the most trustworthy
      // source available, since it doesn't depend on the source page's DOM
      // markup or a slug guess. It's looked up async (IndexedDB), so it can
      // upgrade the name set above once it resolves, e.g. on a fresh tab
      // where sessionStorage is empty but this artist was searched before.
      getStoredArtistDisplayName(artistPath).then((cachedDisplayName) => {
        if (cachedDisplayName && cachedDisplayName !== artistName) {
          setActiveArtist({ displayName: cachedDisplayName, path: artistPath, songCount: null });
        }
      });

      // Restore the search that led here if there is one. If absent (e.g. arriving
      // from a chord sheet's artist link), fall back to the artist name so the
      // field is not left empty.
      const stored = readStoredSearch();
      if (stored?.query) {
        setInput(stored.query);
        setSubmittedQuery(stored.query);
        setOriginalQuery(stored.query);
      } else {
        setInput(artistName);
      }

      setHasSearched(true);

      // Note: shouldFetch stays false here. Setting it would run a search for the
      // artist's name; the activeArtist effect in useSearchReducer fetches that
      // artist's songs instead.
      isInitialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, location.pathname, isClearing, isOnArtistPage, getCurrentArtistPath]);
}
