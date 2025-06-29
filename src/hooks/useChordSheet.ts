import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChordSheetLoadingStrategy } from "@/utils/chord-sheet-loading-strategy";
import { NavigationUtils } from "@/utils/navigation-utils";
import { FetchErrorHandler } from "@/utils/fetch-error-handler";
import { validateURL } from "@/utils/url-validator";
import { URLDeterminationStrategy } from "./useChordSheet/url-determination-strategy";
import { DataHandlers } from "./useChordSheet/data-handlers";
import { CacheCoordinator } from "./useChordSheet/cache-coordinator";
import { ChordSheet } from "@/types/chordSheet";
import { ChordSheetWithUIState, createDefaultChordSheetWithUIState } from "@/types/chordSheetWithUIState";

const initialState: ChordSheetWithUIState = createDefaultChordSheetWithUIState();

export function useChordSheet(url?: string, originalPath?: string) {
  const [chordData, setChordData] = useState<ChordSheetWithUIState>(initialState);
  const params = useParams<{ artist?: string; song?: string; id?: string }>();
  const navigate = useNavigate();
  
  // Initialize all our modular strategies (memoized to prevent recreation)
  const loadingStrategy = useMemo(() => new ChordSheetLoadingStrategy(), []);
  const urlStrategy = useMemo(() => new URLDeterminationStrategy(), []);
  const navigationUtils = useMemo(() => new NavigationUtils(), []);
  const dataHandlers = useMemo(() => new DataHandlers(), []);
  const cacheCoordinator = useMemo(() => new CacheCoordinator(), []);
  const errorHandler = useMemo(() => new FetchErrorHandler(), []);

  // Clear expired cache entries when hook is first used
  useEffect(() => {
    cacheCoordinator.clearExpiredCache();
  }, [cacheCoordinator]);

  useEffect(() => {
    const loadChordSheet = async () => {
      try {
        // Step 1: Try loading from local sources first (My Chord Sheets context)
        if (loadingStrategy.shouldLoadLocal(params.artist, params.song)) {
          const localData = await loadingStrategy.loadLocal(params.artist, params.song);
          if (localData) {
            setChordData(localData);
            return;
          }
        }
        
        // Step 2: Fall back to remote fetch (cache + scraping as last resort)
        await fetchFromRemote();
      } catch (error) {
        console.error("Unexpected error in loadChordSheet:", error);
        dataHandlers.handleErrorState(
          "An unexpected error occurred while loading the chord sheet.",
          undefined,
          initialState,
          setChordData
        );
      }
    };

    const fetchFromRemote = async () => {
      // Determine the fetch URL using our URL strategy
      const { fetchUrl, storageKey, isReconstructed } = await urlStrategy.determineFetchUrl(
        url,
        params.artist,
        params.song,
        originalPath
      );

      if (!fetchUrl) {
        dataHandlers.handleErrorState(
          "Could not find the chord sheet. Please try searching for it again.",
          undefined,
          initialState,
          setChordData
        );
        return;
      }

      // Validate URL format
      try {
        validateURL(fetchUrl);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Invalid URL format";
        dataHandlers.handleErrorState(
          errorMessage,
          fetchUrl,
          initialState,
          setChordData
        );
        return;
      }

      // Set loading state
      dataHandlers.setLoadingState(fetchUrl, setChordData);

      try {
        await fetchChordSheetData(fetchUrl, storageKey, isReconstructed);
      } catch (err) {
        handleFetchError(err, fetchUrl, isReconstructed);
      }
    };

    const fetchChordSheetData = async (fetchUrl: string, storageKey: string, isReconstructed: boolean) => {
      // Use the cache coordinator for fetching with consistent storage key
      const chordSheet = await cacheCoordinator.getChordSheetData(storageKey, fetchUrl);

      if (!chordSheet?.songChords) {
        throw new Error("No chord sheet content found. This song may not be available.");
      }

      handleFreshData(chordSheet, fetchUrl);
    };

    const handleFreshData = (chordSheet: ChordSheet, fetchUrl: string) => {
      // Update URL if needed using navigation utils (only if artist/title exist)
      if (chordSheet.artist && chordSheet.title) {
        navigationUtils.performUrlUpdate(
          { artist: chordSheet.artist, song: chordSheet.title },
          params,
          fetchUrl,
          navigate,
          window.location.pathname
        );
      }
      
      dataHandlers.handleFreshData(chordSheet, setChordData);
    };

    const handleFetchError = (err: unknown, fetchUrl: string, isReconstructed: boolean) => {
      console.error("Error fetching chord sheet:", err);

      const errorMessage = errorHandler.formatFetchError(err, fetchUrl, isReconstructed);
      
      dataHandlers.handleErrorState(
        errorMessage,
        fetchUrl,
        initialState,
        setChordData
      );
    };

    loadChordSheet();
  }, [
    url, 
    originalPath,
    params,
    navigate, 
    loadingStrategy,
    urlStrategy,
    navigationUtils,
    dataHandlers,
    cacheCoordinator,
    errorHandler
  ]);

  return chordData;
}
