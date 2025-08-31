import { useState, useRef, useTransition, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearchState } from "../../../context";
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
  const { searchState, updateSearchState } = useSearchState();
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

  // Initialize state from search context or defaults
  const [artistInput, setArtistInput] = useState(searchState.query.artist || "");
  const [songInput, setSongInput] = useState(searchState.query.song || "");
  const [prevArtistInput, setPrevArtistInput] = useState(searchState.query.artist || "");
  const [prevSongInput, setPrevSongInput] = useState(searchState.query.song || "");
  const [submittedArtist, setSubmittedArtist] = useState(searchState.query.artist || "");
  const [submittedSong, setSubmittedSong] = useState(searchState.query.song || "");
  const [originalSearchArtist, setOriginalSearchArtist] = useState(searchState.originalQuery?.artist || "");
  const [originalSearchSong, setOriginalSearchSong] = useState(searchState.originalQuery?.song || "");
  const [hasSearched, setHasSearched] = useState(!!(searchState.query.artist || searchState.query.song));
  const [shouldFetch, setShouldFetch] = useState(false);
  const [activeArtist, setActiveArtist] = useState(null);

  // Helper function to update search state with original query
  const updateSearchStateWithOriginal = (searchType: "artist" | "song" | "artist-song", query: { artist: string; song: string }, originalQuery?: { artist: string; song: string }) => {
    updateSearchState({
      searchType,
      query,
      originalQuery: originalQuery || query,
      results: []
    });
  };

  // Sync local state with search context when it changes
  useEffect(() => {
    console.log('🔄 useSearchTabLogic: syncing state with search context:', {
      queryArtist: searchState.query.artist,
      querySong: searchState.query.song,
      originalArtist: searchState.originalQuery?.artist,
      originalSong: searchState.originalQuery?.song
    });
    
    setArtistInput(searchState.query.artist || "");
    setSongInput(searchState.query.song || "");
    setPrevArtistInput(searchState.query.artist || "");
    setPrevSongInput(searchState.query.song || "");
    setSubmittedArtist(searchState.query.artist || "");
    setSubmittedSong(searchState.query.song || "");
    setOriginalSearchArtist(searchState.originalQuery?.artist || "");
    setOriginalSearchSong(searchState.originalQuery?.song || "");
    setHasSearched(!!(searchState.query.artist || searchState.query.song));
  }, [searchState.query.artist, searchState.query.song, searchState.originalQuery?.artist, searchState.originalQuery?.song]);

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
    updateSearchState,
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
    updateSearchStateWithOriginal(searchType, { artist: artistValue, song: songValue });
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
         updateSearchStateWithOriginal("artist", { artist: "", song: "" });
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
    searchState,
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
