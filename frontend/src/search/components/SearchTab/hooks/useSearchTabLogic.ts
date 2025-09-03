import { useState, useRef, useTransition, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNavigation } from "@/hooks/navigation";
import type {
  SearchTabLogicProps,
  SearchTabLogicResult,
} from "./useSearchTabLogic.types";

import { useInitSearchStateEffect } from "./useInitSearchStateEffect";

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

  // Initialize state from URL parameters or defaults
  const [artistInput, setArtistInput] = useState("");
  const [songInput, setSongInput] = useState("");
  const [prevArtistInput, setPrevArtistInput] = useState("");
  const [prevSongInput, setPrevSongInput] = useState("");
  const [submittedArtist, setSubmittedArtist] = useState("");
  const [submittedSong, setSubmittedSong] = useState("");
  const [originalSearchArtist, setOriginalSearchArtist] = useState("");
  const [originalSearchSong, setOriginalSearchSong] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [activeArtist, setActiveArtist] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  // Session storage keys for search query persistence
  const SEARCH_QUERY_KEY = 'chordium_search_query';

  // Load search query from session storage on mount and when returning to search page
  useEffect(() => {
    console.log('🔄 useSearchTabLogic: useEffect triggered - pathname:', location.pathname);
    
    try {
      const storedQuery = sessionStorage.getItem(SEARCH_QUERY_KEY);
      console.log('🔄 useSearchTabLogic: session storage contains:', storedQuery);
      
      if (storedQuery) {
        const { artist, song } = JSON.parse(storedQuery);
        
        if (artist || song) {
          console.log('🔄 useSearchTabLogic: RESTORING search query from session storage:', { artist, song });
          setOriginalSearchArtist(artist || '');
          setOriginalSearchSong(song || '');
          setArtistInput(artist || '');
          setSongInput(song || '');
          setPrevArtistInput(artist || '');
          setPrevSongInput(song || '');
          setSubmittedArtist(artist || '');
          setSubmittedSong(song || '');
          setHasSearched(true);
          console.log('🔄 useSearchTabLogic: RESTORATION COMPLETED');
        } else {
          console.log('🔄 useSearchTabLogic: stored query exists but no artist/song data');
        }
      } else {
        console.log('🔄 useSearchTabLogic: no stored query found in session storage');
      }
    } catch (error) {
      console.warn('Failed to restore search query from session storage:', error);
      sessionStorage.removeItem(SEARCH_QUERY_KEY);
    }
  }, [location.pathname]); // Restore whenever the pathname changes (including returning to search)

  // Save search query to session storage when submitting search
  const saveSearchQueryToSession = useCallback((artist: string, song: string) => {
    try {
      const searchData = { artist, song };
      sessionStorage.setItem(SEARCH_QUERY_KEY, JSON.stringify(searchData));
      console.log('🔄 useSearchTabLogic: saved search query to session storage:', searchData);
    } catch (error) {
      console.warn('Failed to save search query to session storage:', error);
    }
  }, []);

  // Store the current route whenever it changes (for tab switching)
  // Only store search-related routes: /search (with query) or /:artist
  const saveCurrentRoute = useCallback(() => {
    try {
      const storedQuery = sessionStorage.getItem(SEARCH_QUERY_KEY);
      if (storedQuery) {
        const searchData = JSON.parse(storedQuery);
        
        // Only store routes that are part of the search flow
        const isSearchRoute = location.pathname === '/search' && location.search;
        const isArtistRoute = location.pathname !== '/search' && 
          !location.pathname.startsWith('/my-chord-sheets') && 
          !location.pathname.startsWith('/upload') && 
          location.pathname !== '/' &&
          location.pathname.split('/').filter(segment => segment.length > 0).length === 1;
        
        if (isSearchRoute || isArtistRoute) {
          searchData.lastRoute = location.pathname + location.search;
          sessionStorage.setItem(SEARCH_QUERY_KEY, JSON.stringify(searchData));
          console.log('🔄 useSearchTabLogic: UPDATED route in session storage:', searchData.lastRoute);
          console.log('🔄 useSearchTabLogic: full storage data now:', JSON.stringify(searchData));
        } else {
          console.log('🔄 useSearchTabLogic: skipping route storage (not search flow):', location.pathname);
        }
      }
    } catch (error) {
      console.warn('Failed to update route in session storage:', error);
    }
  }, [location.pathname, location.search]);

  // Update route in session storage whenever location changes
  useEffect(() => {
    saveCurrentRoute();
  }, [saveCurrentRoute]);

  // Clear search query from session storage
  const clearSearchQueryFromSession = useCallback(() => {
    try {
      console.log('🧹 clearSearchQueryFromSession: removing from session storage');
      sessionStorage.removeItem(SEARCH_QUERY_KEY);
      console.log('🧹 clearSearchQueryFromSession: successfully removed from session storage');
      
      // Verify it's actually gone
      const checkStorage = sessionStorage.getItem(SEARCH_QUERY_KEY);
      console.log('🧹 clearSearchQueryFromSession: verification - storage now contains:', checkStorage);
    } catch (error) {
      console.warn('Failed to clear search query from session storage:', error);
    }
  }, []);

  // Helper function to update search state (now just updates local state)
  const updateSearchStateWithOriginal = (state: { artist: string; song: string; results: any[] }) => {
    // Update local state directly instead of going through context
    setSubmittedArtist(state.artist);
    setSubmittedSong(state.song);
    setOriginalSearchArtist(state.artist);
    setOriginalSearchSong(state.song);
    setHasSearched(!!(state.artist || state.song));
  };

  // Extract URL parameters using useMemo to prevent unnecessary recalculations
  const urlParams = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const artistParam = searchParams.get('artist') || "";
    const songParam = searchParams.get('song') || "";
    
    // Ensure proper decoding of URL parameters
    const artist = decodeURIComponent(artistParam);
    const song = decodeURIComponent(songParam);
    
    return { artist, song };
  }, [location.search]);

  // Sync local state with URL parameters when it changes
  // This effect handles URL changes but does NOT restore input field values from URL
  // Input fields should only get values from session storage or user input
  useEffect(() => {
    // Skip URL sync if we're in the middle of clearing
    if (isClearing) {
      console.log('🔄 useSearchTabLogic: skipping URL sync - clearing in progress');
      return;
    }
    
    console.log('🔄 useSearchTabLogic: syncing state with URL parameters:', {
      artist: urlParams.artist,
      song: urlParams.song,
      currentOriginalArtist: originalSearchArtist,
      currentOriginalSong: originalSearchSong,
      hasSearched
    });
    
    // IMPORTANT: We do NOT restore input field values from URL parameters
    // Input fields should only get values from session storage or user input
    // URL parameters are only used to reflect the current state, not drive it
    
    if ((urlParams.artist || urlParams.song) && !hasSearched) {
      // This case should rarely happen - only if someone manually types a URL
      console.log('🔄 useSearchTabLogic: URL params detected but not restoring to input fields (URL should not drive state)');
    } else if (!urlParams.artist && !urlParams.song && !hasSearched) {
      // No URL parameters and no existing search - this is fine, do nothing
      console.log('🔄 useSearchTabLogic: no URL params and no existing search - this is expected, doing nothing');
    } else if (hasSearched && (originalSearchArtist || originalSearchSong)) {
      // We have an existing search query - this is fine, do nothing
      // Input fields should already have the correct values from session storage
      console.log('🔄 useSearchTabLogic: existing search query detected - input fields should already have correct values from session storage');
    } else {
      console.log('🔄 useSearchTabLogic: no action needed - URL sync effect does not modify input field values');
    }
  }, [urlParams, hasSearched, originalSearchArtist, originalSearchSong, isClearing]);

  useInitSearchStateEffect({
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
  });

  function handleInputChange(artistValue: string, songValue: string) {
    setArtistInput(artistValue);
    setSongInput(songValue);
    const artistCleared = prevArtistInput && !artistValue;
    const songCleared = prevSongInput && !songValue;
    
    // If any input is cleared, ONLY clear the local state
    // DO NOT update the URL - that should only happen with the trash button
    if (artistCleared || songCleared) {
      console.log('🧹 handleInputChange: individual field cleared, updating local state only (not URL)');
      
      // No navigation, no URL changes - just clear the local input state
      // The URL should preserve the original search query until trash button is clicked
      // This prevents the URL from being cleared when clearing individual fields
    }
    
    setPrevArtistInput(artistValue);
    setPrevSongInput(songValue);
    setShouldFetch(false);
  }

  function handleSearchSubmit(artistValue: string, songValue: string) {
    setActiveArtist(null);
    setLoading(true);
    setSubmittedArtist(artistValue);
    setSubmittedSong(songValue);
    
    // Preserve the original search query for navigation back
    setOriginalSearchArtist(artistValue);
    setOriginalSearchSong(songValue);
    
    // Save search query to session storage for persistence across component unmounts
    saveSearchQueryToSession(artistValue, songValue);
    
    // Determine search type based on input values
    // Following backend logic in determineSearchType()
    let searchType: "artist" | "song" | "artist-song";
    if (artistValue && !songValue) {
      searchType = "artist";
    } else if (!artistValue && songValue) {
      searchType = "song";
    } else if (artistValue && songValue) {
      searchType = "song"; // Backend treats artist+song as song search
    } else {
      searchType = "artist"; // Default fallback
    }
         updateSearchStateWithOriginal({ artist: artistValue, song: songValue, results: [] });
    setHasSearched(true);
    setShouldFetch(true);
    startTransition(() => {
      const params = new URLSearchParams();
      if (artistValue) params.set("artist", artistValue);
      if (songValue) params.set("song", songValue);
      const searchUrl = params.toString()
        ? `/search?${params.toString()}`
        : "/search";
      navigate(searchUrl, { replace: location.pathname.startsWith("/search") });
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
      // Navigate back to search results using original search parameters
      // Use the preserved original search query instead of the current submitted values
      const params = new URLSearchParams();
      const artistToUse = originalSearchArtist || submittedArtist;
      const songToUse = originalSearchSong || submittedSong;
      
      if (artistToUse) params.set("artist", artistToUse);
      if (songToUse) params.set("song", songToUse);
      const searchUrl = params.toString()
        ? `/search?${params.toString()}`
        : "/search";
      navigate(searchUrl, { replace: true });
    });
  }

  function handleClearSearch() {
    console.log('🧹 handleClearSearch: STARTING CLEAR OPERATION');
    
    // Set clearing flag to prevent state restoration
    setIsClearing(true);
    
    // Clear session storage FIRST to prevent restoration
    console.log('🧹 handleClearSearch: clearing session storage');
    clearSearchQueryFromSession();
    
    // Clear all local state
    console.log('🧹 handleClearSearch: clearing local state');
    setArtistInput("");
    setSongInput("");
    setPrevArtistInput("");
    setPrevSongInput("");
    setSubmittedArtist("");
    setSubmittedSong("");
    setOriginalSearchArtist(null);
    setOriginalSearchSong(null);
    setHasSearched(false);
    setShouldFetch(false);
    setActiveArtist(null);
    setLoading(false);
    
    // Update search state
    console.log('🧹 handleClearSearch: updating search state');
    updateSearchStateWithOriginal({ artist: "", song: "", results: [] });
    
    // Navigate to clean search page WITHOUT query parameters
    console.log('🧹 handleClearSearch: navigating to clean search page');
    startTransition(() => {
      // Use replace: true to avoid adding to browser history
      // Navigate to clean /search without any query parameters
      // This ensures the URL sync effect won't see any artist/song params
      navigate("/search", { replace: true });
    });
    
    // Force clear URL parameters by updating the location
    // This prevents the URL sync effect from restoring state
    if (location.search) {
      console.log('🧹 handleClearSearch: forcing URL parameter clear');
      window.history.replaceState(null, '', '/search');
    }
    
    console.log('🧹 handleClearSearch: CLEAR OPERATION COMPLETED');
    
    // Reset clearing flag after a short delay to allow navigation to complete
    setTimeout(() => {
      setIsClearing(false);
      console.log('🧹 handleClearSearch: clearing flag reset');
    }, 100);
  }

  const clearDisabled = !artistInput && !songInput && !hasSearched;

  return {
    activeArtist,
    loading,
    artistInput,
    songInput,
    clearDisabled,
    hasSearched,
    searchState: { 
      searchType: "artist", // Default search type
      query: { artist: artistInput, song: songInput }, 
      originalQuery: { artist: originalSearchArtist, song: originalSearchSong }, 
      results: [] 
    }, // Mock searchState for now
    submittedArtist,
    submittedSong,
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
