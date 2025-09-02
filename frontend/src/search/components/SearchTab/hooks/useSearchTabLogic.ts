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

  // Session storage keys for search query persistence
  const SEARCH_QUERY_KEY = 'chordium_search_query';

  // Load search query from session storage on mount
  useEffect(() => {
    try {
      const storedQuery = sessionStorage.getItem(SEARCH_QUERY_KEY);
      if (storedQuery) {
        const { artist, song } = JSON.parse(storedQuery);
        
        if (artist || song) {
          console.log('🔄 useSearchTabLogic: restoring search query from session storage:', { artist, song });
          setOriginalSearchArtist(artist || '');
          setOriginalSearchSong(song || '');
          setArtistInput(artist || '');
          setSongInput(song || '');
          setPrevArtistInput(artist || '');
          setPrevSongInput(song || '');
          setSubmittedArtist(artist || '');
          setSubmittedSong(song || '');
          setHasSearched(true);
        }
      }
    } catch (error) {
      console.warn('Failed to restore search query from session storage:', error);
      sessionStorage.removeItem(SEARCH_QUERY_KEY);
    }
  }, []);

  // Save search query to session storage whenever it changes
  const saveSearchQueryToSession = useCallback((artist: string, song: string) => {
    try {
      const searchData = { artist, song };
      sessionStorage.setItem(SEARCH_QUERY_KEY, JSON.stringify(searchData));
      console.log('🔄 useSearchTabLogic: saved search query to session storage:', searchData);
    } catch (error) {
      console.warn('Failed to save search query to session storage:', error);
    }
  }, []);

  // Clear search query from session storage
  const clearSearchQueryFromSession = useCallback(() => {
    try {
      sessionStorage.removeItem(SEARCH_QUERY_KEY);
      console.log('🔄 useSearchTabLogic: cleared search query from session storage');
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
  useEffect(() => {
    console.log('🔄 useSearchTabLogic: syncing state with URL parameters:', {
      artist: urlParams.artist,
      song: urlParams.song,
      currentOriginalArtist: originalSearchArtist,
      currentOriginalSong: originalSearchSong
    });
    
    // Only update state if we have URL parameters AND we don't have an existing search query
    // This prevents overwriting the original search query once it's been submitted
    if ((urlParams.artist || urlParams.song) && !hasSearched) {
      console.log('🔄 useSearchTabLogic: updating state with URL params (new search)');
      setArtistInput(urlParams.artist);
      setSongInput(urlParams.song);
      setPrevArtistInput(urlParams.artist);
      setPrevSongInput(urlParams.song);
      setSubmittedArtist(urlParams.artist);
      setSubmittedSong(urlParams.song);
      setOriginalSearchArtist(urlParams.artist);
      setOriginalSearchSong(urlParams.song);
      setHasSearched(true);
    } else if (!urlParams.artist && !urlParams.song && !hasSearched) {
      // No URL parameters and no existing search - reset everything
      console.log('🔄 useSearchTabLogic: no URL params and no existing search, resetting');
      setArtistInput('');
      setSongInput('');
      setPrevArtistInput('');
      setPrevSongInput('');
      setSubmittedArtist('');
      setSubmittedSong('');
      setOriginalSearchArtist('');
      setOriginalSearchSong('');
      setHasSearched(false);
    } else {
      // We have an existing search query - preserve it, don't overwrite
      console.log('🔄 useSearchTabLogic: preserving existing search query:', {
        originalSearchArtist,
        originalSearchSong,
        hasSearched
      });
      
      // Restore the original search query to input fields for display
      if (originalSearchArtist || originalSearchSong) {
        setArtistInput(originalSearchArtist || '');
        setSongInput(originalSearchSong || '');
        setPrevArtistInput(originalSearchArtist || '');
        setPrevSongInput(originalSearchSong || '');
        setSubmittedArtist(originalSearchArtist || '');
        setSubmittedSong(originalSearchSong || '');
      }
    }
  }, [urlParams, hasSearched, originalSearchArtist, originalSearchSong]);

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
    if (artistCleared || songCleared) {
      startTransition(() => {
        const params = new URLSearchParams();
        if (artistValue) params.set("artist", artistValue);
        if (songValue) params.set("song", songValue);
        const searchUrl = params.toString()
          ? `/search?${params.toString()}`
          : "/search";
        navigate(searchUrl, { replace: true });
      });
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
    
    // Clear search query from session storage
    clearSearchQueryFromSession();
    
    updateSearchStateWithOriginal({ artist: "", song: "", results: [] });
    startTransition(() => {
      navigate("/search", { replace: true });
    });
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
