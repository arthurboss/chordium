import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChordSheetLoadingStrategy } from "@/utils/chord-sheet-loading-strategy";
import { NavigationUtils } from "@/utils/navigation-utils";
import { FetchErrorHandler } from "@/utils/fetch-error-handler";
import { validateURL } from "@/utils/url-validator";
import { URLDeterminationStrategy } from "./useChordSheet/url-determination-strategy";
import { DataHandlers } from "./useChordSheet/data-handlers";
import { BackgroundRefreshHandler } from "./useChordSheet/background-refresh-handler";
import { CacheCoordinator } from "./useChordSheet/cache-coordinator";

export interface ChordSheetData {
  content: string;
  capo: string;
  tuning: string;
  key: string;
  artist: string;
  song: string;
  loading: boolean;
  error: string | null;
  originalUrl?: string;
}

const initialState: ChordSheetData = {
  content: "",
  capo: "",
  tuning: "",
  key: "",
  artist: "",
  song: "",
  loading: true,
  error: null,
};

export function useChordSheet(url?: string) {
  const [chordData, setChordData] = useState<ChordSheetData>(initialState);
  const params = useParams<{ artist?: string; song?: string; id?: string }>();
  const navigate = useNavigate();
  
  // Initialize all our modular strategies (memoized to prevent recreation)
  const loadingStrategy = useMemo(() => new ChordSheetLoadingStrategy(), []);
  const urlStrategy = useMemo(() => new URLDeterminationStrategy(), []);
  const navigationUtils = useMemo(() => new NavigationUtils(), []);
  const dataHandlers = useMemo(() => new DataHandlers(), []);
  const refreshHandler = useMemo(() => new BackgroundRefreshHandler(navigationUtils), [navigationUtils]);
  const cacheCoordinator = useMemo(() => new CacheCoordinator(), []);
  const errorHandler = useMemo(() => new FetchErrorHandler(), []);

  // Clear expired cache entries when hook is first used
  useEffect(() => {
    cacheCoordinator.clearExpiredCache();
  }, [cacheCoordinator]);

  useEffect(() => {
    const loadChordSheet = async () => {
      try {
        // Step 1: Try loading from local sources first (My Songs context)
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
      const { url: fetchUrl, isReconstructed } = await urlStrategy.determineFetchUrl(
        url,
        params.artist,
        params.song
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
        await fetchChordSheetData(fetchUrl, isReconstructed);
      } catch (err) {
        handleFetchError(err, fetchUrl, isReconstructed);
      }
    };

    const fetchChordSheetData = async (fetchUrl: string, isReconstructed: boolean) => {
      // Create background handler function
      const backgroundHandler = (updatedData: Record<string, unknown>) => {
        refreshHandler.handleBackgroundRefresh(
          updatedData,
          fetchUrl,
          params,
          setChordData,
          navigate
        );
      };

      // Use the cache coordinator for fetching
      const { immediate, refreshPromise } = await cacheCoordinator.getChordSheetWithRefresh(
        params.artist || null,
        params.song || null,
        fetchUrl,
        backgroundHandler
      );

      if (immediate) {
        dataHandlers.handleImmediateData(immediate, refreshPromise, setChordData);
        return;
      }

      // Wait for fresh data if no cached data available
      const freshData = await refreshPromise;
      if (!freshData?.content) {
        throw new Error("No chord sheet content found. This song may not be available.");
      }

      handleFreshData(freshData, fetchUrl);
    };

    const handleFreshData = (freshData: Record<string, unknown>, fetchUrl: string) => {
      // Update URL if needed using navigation utils (only if artist/song exist)
      if (freshData.artist && freshData.song && typeof freshData.artist === 'string' && typeof freshData.song === 'string') {
        navigationUtils.performUrlUpdate(
          { artist: freshData.artist, song: freshData.song },
          params,
          fetchUrl,
          navigate,
          window.location.pathname
        );
      }
      
      dataHandlers.handleFreshData(freshData, setChordData);
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
    params.artist, 
    params.song, 
    params.id, 
    navigate, 
    loadingStrategy,
    urlStrategy,
    navigationUtils,
    dataHandlers,
    refreshHandler,
    cacheCoordinator,
    errorHandler
  ]);

  return chordData;
}
