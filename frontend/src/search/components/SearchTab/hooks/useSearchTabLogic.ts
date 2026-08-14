import { useState, useRef, useTransition, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNavigation } from "@/hooks/navigation";
import type {
  SearchTabLogicProps,
  SearchTabLogicResult,
} from "./useSearchTabLogic.types";

import { useInitSearchStateEffect } from "./useInitSearchStateEffect";
import { readStoredSearch, SEARCH_QUERY_KEY } from "./storedSearch";

export function useSearchTabLogic(
  props: SearchTabLogicProps
): SearchTabLogicResult {
  const { setMySongs, setActiveTab } = props;
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialized = useRef(false);
  const {
    navigateToArtist,
    isOnArtistPage,
    getCurrentArtistPath,
  } = useNavigation();

  const [input, setInput] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  // Narrows an open artist's song list. Deliberately separate from `input`: the
  // box arrives holding the artist's name, and matching song titles against that
  // would hide every song not named after the act.
  const [artistFilter, setArtistFilter] = useState("");
  // Kept separately from submittedQuery so that opening an artist, which does not
  // itself submit a search, can still return to the results that led there.
  const [originalQuery, setOriginalQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [activeArtist, setActiveArtist] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  // Load search query from session storage on mount and when returning to search page
  useEffect(() => {
    const stored = readStoredSearch();
    if (!stored?.query) return;

    setInput(stored.query);
    setSubmittedQuery(stored.query);
    setOriginalQuery(stored.query);
    setHasSearched(true);
  }, [location.pathname]); // Restore whenever the pathname changes (including returning to search)

  const saveSearchQueryToSession = useCallback((query: string) => {
    try {
      sessionStorage.setItem(SEARCH_QUERY_KEY, JSON.stringify({ query }));
    } catch (error) {
      console.warn('Failed to save search query to session storage:', error);
    }
  }, []);

  // Store the current route whenever it changes (for tab switching)
  // Only store search-related routes: /search (with query) or /:artist
  const saveCurrentRoute = useCallback(() => {
    try {
      const storedQuery = sessionStorage.getItem(SEARCH_QUERY_KEY);
      if (!storedQuery) return;
      const searchData = JSON.parse(storedQuery);

      const isSearchRoute = location.pathname === '/search' && location.search;
      const isArtistRoute = location.pathname !== '/search' &&
        !location.pathname.startsWith('/my-chord-sheets') &&
        !location.pathname.startsWith('/upload') &&
        location.pathname !== '/' &&
        location.pathname.split('/').filter(segment => segment.length > 0).length === 1;

      if (isSearchRoute || isArtistRoute) {
        searchData.lastRoute = location.pathname + location.search;
        sessionStorage.setItem(SEARCH_QUERY_KEY, JSON.stringify(searchData));
      }
    } catch (error) {
      console.warn('Failed to update route in session storage:', error);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    saveCurrentRoute();
  }, [saveCurrentRoute]);

  const clearSearchQueryFromSession = useCallback(() => {
    try {
      sessionStorage.removeItem(SEARCH_QUERY_KEY);
    } catch (error) {
      console.warn('Failed to clear search query from session storage:', error);
    }
  }, []);

  useInitSearchStateEffect({
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
  });

  // Opening an artist starts their list whole, whatever the box happens to hold.
  useEffect(() => {
    setArtistFilter("");
  }, [activeArtist?.path]);

  function handleInputChange(value: string) {
    setInput(value);
    // While an artist is open, typing narrows the songs already on screen; there
    // is nothing to narrow otherwise, and a search only runs when submitted.
    if (activeArtist) setArtistFilter(value);
    // The URL keeps the submitted search until the trash button is pressed, so
    // that emptying the field does not discard the results already on screen.
    setShouldFetch(false);
  }

  function handleSearchSubmit(value: string) {
    const query = value.trim();
    if (!query) return;

    setActiveArtist(null);
    setLoading(true);
    setSubmittedQuery(query);
    setOriginalQuery(query);
    saveSearchQueryToSession(query);
    setHasSearched(true);
    setShouldFetch(true);

    startTransition(() => {
      navigate(`/search?q=${encodeURIComponent(query)}`, {
        replace: location.pathname.startsWith("/search"),
      });
    });
  }

  function handleLoadingChange(isLoading: boolean) {
    setLoading(isLoading);
  }

  function handleArtistSelect(artist) {
    setActiveArtist(artist);
    startTransition(() => {
      navigateToArtist(artist);
    });
  }

  function handleBackToArtistList() {
    setActiveArtist(null);
    startTransition(() => {
      // Return to the search that led here, not to whatever is in the field now
      const query = originalQuery || submittedQuery;
      navigate(query ? `/search?q=${encodeURIComponent(query)}` : "/search", { replace: true });
    });
  }

  function handleClearSearch() {
    // Set clearing flag to prevent state restoration
    setIsClearing(true);

    // Clear session storage FIRST to prevent restoration
    clearSearchQueryFromSession();

    setInput("");
    setSubmittedQuery("");
    setOriginalQuery("");
    setArtistFilter("");
    setHasSearched(false);
    setShouldFetch(false);
    setActiveArtist(null);
    setLoading(false);

    startTransition(() => {
      navigate("/search", { replace: true });
    });

    // Force clear URL parameters by updating the location, so the init effect
    // does not see a query and restore the state that was just cleared.
    if (location.search) {
      window.history.replaceState(null, '', '/search');
    }

    setTimeout(() => {
      setIsClearing(false);
    }, 100);
  }

  const clearDisabled = !input && !hasSearched;

  return {
    activeArtist,
    loading,
    input,
    submittedQuery,
    artistFilter,
    clearDisabled,
    hasSearched,
    shouldFetch,
    handleBackToArtistList,
    handleArtistSelect,
    handleInputChange,
    handleSearchSubmit,
    handleLoadingChange,
    handleClearSearch,
    setShouldFetch,
    setMySongs,
    setActiveTab,
  };
}
