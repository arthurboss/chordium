import { useState, useRef, useTransition } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSearchState } from "../../../context";
import { toSlug } from "@/utils/url-slug-utils";
import { useArtistNavigation } from "@/search";
import type {
  SearchTabLogicProps,
  SearchTabLogicResult,
} from "./useSearchTabLogic.types";
import { usePreserveSearchUrlEffect } from "./usePreserveSearchUrlEffect";
import { useInitSearchStateEffect } from "./useInitSearchStateEffect";
import { useInitArtistPageEffect } from "./useInitArtistPageEffect";

export function useSearchTabLogic(
  props: SearchTabLogicProps
): SearchTabLogicResult {
  const { setMySongs, setActiveTab, setSelectedSong } = props;
  const { searchState, updateSearchState } = useSearchState();
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const [selectedSongLocal, setSelectedSongLocal] = useState(null);
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
    navigateBackToSearch,
    isOnArtistPage,
    getCurrentArtistPath,
  } = useArtistNavigation();

  usePreserveSearchUrlEffect(location);
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
    setHasSearched,
    setShouldFetch
  );

  function handleInputChange(artistValue: string, songValue: string) {
    setArtistInput(artistValue);
    setSongInput(songValue);
    const artistCleared = prevArtistInput && !artistValue;
    const songCleared = prevSongInput && !songValue;
    if (artistCleared || songCleared) {
      startTransition(() => {
        const params = new URLSearchParams();
        if (artistValue) params.set("artist", toSlug(artistValue));
        if (songValue) params.set("song", toSlug(songValue));
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
    setSelectedSongLocal(null);
    setLoading(true);
    setSubmittedArtist(artistValue);
    setSubmittedSong(songValue);
    updateSearchState({ artist: artistValue, song: songValue, results: [] });
    setHasSearched(true);
    setShouldFetch(true);
    startTransition(() => {
      const params = new URLSearchParams();
      if (artistValue) params.set("artist", toSlug(artistValue));
      if (songValue) params.set("song", toSlug(songValue));
      const searchUrl = params.toString()
        ? `/search?${params.toString()}`
        : "/search";
      navigate(searchUrl, { replace: location.pathname.startsWith("/search") });
    });
  }

  function handleLoadingChange(isLoading: boolean) {
    setLoading(isLoading);
  }

  function handleSongSelect(song) {
    setSelectedSongLocal(song);
  }

  function handleArtistSelect(artist) {
    setActiveArtist(artist);
    startTransition(() => {
      navigateToArtist(artist);
    });
  }

  function handleBackToSearch() {
    setSelectedSongLocal(null);
  }

  function handleBackToArtistList() {
    setActiveArtist(null);
    startTransition(() => {
      navigateBackToSearch();
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
    setSelectedSongLocal(null);
    setLoading(false);
    updateSearchState({ artist: "", song: "", results: [] });
    startTransition(() => {
      navigate("/search", { replace: true });
    });
  }

  const clearDisabled = !artistInput && !songInput && !hasSearched;

  return {
    selectedSongLocal,
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
    handleBackToSearch,
    handleBackToArtistList,
    handleSongSelect,
    handleArtistSelect,
    handleInputChange,
    handleSearchSubmit,
    handleLoadingChange,
    handleClearSearch,
    setShouldFetch,
    setMySongs,
    setActiveTab,
    setSelectedSong,
  };
}
