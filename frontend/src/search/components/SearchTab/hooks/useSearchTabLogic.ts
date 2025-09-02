import { useState, useRef, useTransition, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toSlug } from "@/utils/url-slug-utils";
import { useNavigation } from "@/hooks/navigation";
import type {
  SearchTabLogicProps,
  SearchTabLogicResult,
} from "./useSearchTabLogic.types";

import { useInitSearchStateEffect } from "./useInitSearchStateEffect";
import { useInitArtistPageEffect } from "./useInitArtistPageEffect";

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
    const artistParam = location.search.split('artist=')[1]?.split('&')[0] || "";
    const songParam = location.search.split('song=')[1]?.split('&')[0] || "";
    return { artist: artistParam, song: songParam };
  }, [location.search]);

  // Sync local state with URL parameters when it changes
  useEffect(() => {
    console.log('🔄 useSearchTabLogic: syncing state with URL parameters:', {
      artist: urlParams.artist,
      song: urlParams.song
    });
    
    setArtistInput(urlParams.artist);
    setSongInput(urlParams.song);
    setPrevArtistInput(urlParams.artist);
    setPrevSongInput(urlParams.song);
    setSubmittedArtist(urlParams.artist);
    setSubmittedSong(urlParams.song);
    setOriginalSearchArtist(urlParams.artist);
    setOriginalSearchSong(urlParams.song);
    setHasSearched(!!(urlParams.artist || urlParams.song));
  }, [urlParams]);

  useInitSearchStateEffect(
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
    setShouldFetch
  );
  useInitArtistPageEffect(
    location,
    isOnArtistPage,
    getCurrentArtistPath,
    isInitialized,
    setActiveArtist,
    setArtistInput,
    setPrevArtistInput,
    setSubmittedArtist,
    setHasSearched
  );

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
      
      if (artistToUse) params.set("artist", toSlug(artistToUse));
      if (songToUse) params.set("song", toSlug(songToUse));
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
