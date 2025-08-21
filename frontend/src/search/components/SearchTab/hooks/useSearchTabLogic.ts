import { useState, useRef, useTransition } from "react";
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
  const [activeArtist, setActiveArtist] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [artistInput, setArtistInput] = useState("");
  const [songInput, setSongInput] = useState("");
  const [prevArtistInput, setPrevArtistInput] = useState("");
  const [prevSongInput, setPrevSongInput] = useState("");
  const [submittedArtist, setSubmittedArtist] = useState("");
  const [submittedSong, setSubmittedSong] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isInitialized = useRef(false);
  const {
    navigateToArtist,
    isOnArtistPage,
    getCurrentArtistPath,
  } = useNavigation();


  useInitSearchStateEffect(
    location,
    isInitialized,
    setArtistInput,
    setSongInput,
    setPrevArtistInput,
    setPrevSongInput,
    setSubmittedArtist,
    setSubmittedSong,
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
    updateSearchState({ 
      searchType,
      results: [],
      query: { artist: artistValue, song: songValue }
    });
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
      // This preserves the user's original query instead of using the artist's display name
      const params = new URLSearchParams();
      if (submittedArtist) params.set("artist", toSlug(submittedArtist));
      if (submittedSong) params.set("song", toSlug(submittedSong));
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
    setHasSearched(false);
    setShouldFetch(false);
    setActiveArtist(null);
    setLoading(false);
    updateSearchState({ 
      searchType: "artist", 
      results: [],
      query: { artist: "", song: "" }
    });
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
