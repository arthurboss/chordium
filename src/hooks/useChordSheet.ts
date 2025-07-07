import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChordSheetLoadingStrategy } from "@/utils/chord-sheet-loading-strategy";
import { NavigationUtils } from "@/utils/navigation-utils";
import { FetchErrorHandler } from "@/utils/fetch-error-handler";
import { URLDeterminationStrategy } from "./useChordSheet/url-determination-strategy";
import { DataHandlers } from "./useChordSheet/data-handlers";
import { unifiedChordSheetCache } from "@/cache/implementations/unified-chord-sheet";
import { ChordSheet } from "@/types/chordSheet";
import { ChordSheetWithUIState, createDefaultChordSheetWithUIState } from "@/types/chordSheetWithUIState";
import { parseStorageKey } from './useChordSheet/utils/parse-storage-key';

const initialState: ChordSheetWithUIState = createDefaultChordSheetWithUIState();

export function useChordSheet(originalPath?: string) {
  const [chordData, setChordData] = useState<ChordSheetWithUIState>(initialState);
  const params = useParams<{ artist?: string; song?: string; id?: string }>();
  const navigate = useNavigate();
  
  // Initialize all our modular strategies (memoized to prevent recreation)
  const loadingStrategy = useMemo(() => new ChordSheetLoadingStrategy(), []);
  const urlStrategy = useMemo(() => new URLDeterminationStrategy(), []);
  const navigationUtils = useMemo(() => new NavigationUtils(), []);
  const dataHandlers = useMemo(() => new DataHandlers(), []);
  const errorHandler = useMemo(() => new FetchErrorHandler(), []);

  // Clear expired cache entries when hook is first used
  useEffect(() => {
    unifiedChordSheetCache.clearExpiredEntries();
  }, []);

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
      // Determine the fetch path using our URL strategy
      const { fetchPath, storageKey, isReconstructed } = await urlStrategy.determineFetchUrl(
        params.artist,
        params.song,
        originalPath
      );

      if (!fetchPath) {
        dataHandlers.handleErrorState(
          "Could not find the chord sheet. Please try searching for it again.",
          undefined,
          initialState,
          setChordData
        );
        return;
      }

      // Basic path validation (should be artist/song format)
      if (!fetchPath.includes('/')) {
        dataHandlers.handleErrorState(
          "Invalid path format. Expected format: artist/song",
          fetchPath,
          initialState,
          setChordData
        );
        return;
      }

      // Set loading state
      dataHandlers.setLoadingState(fetchPath, setChordData);

      try {
        await fetchChordSheetData(fetchPath, storageKey, isReconstructed);
      } catch (err) {
        handleFetchError(err, fetchPath, isReconstructed);
      }
    };

    const fetchChordSheetData = async (fetchPath: string, storageKey: string, isReconstructed: boolean) => {
      // Parse storage key to get artist and title for cache lookup
      const { artist, title } = parseStorageKey(storageKey);
      
      // First try to get from cache
      let chordSheet = await unifiedChordSheetCache.getCachedChordSheet(artist, title);
      
      if (!chordSheet) {
        // Not in cache, fetch from backend
        try {
          const backendUrl = `http://localhost:3001/api/cifraclub-chord-sheet?path=${encodeURIComponent(fetchPath)}`;
          const response = await fetch(backendUrl);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          chordSheet = await response.json();
          
          // Cache the fetched chord sheet
          if (chordSheet && artist && title) {
            await unifiedChordSheetCache.cacheChordSheet(artist, title, chordSheet);
          }
        } catch (error) {
          console.error('Failed to fetch chord sheet:', error);
          throw error;
        }
      }

      if (!chordSheet?.songChords) {
        throw new Error("No chord sheet content found. This song may not be available.");
      }

      handleFreshData(chordSheet, fetchPath);
    };

    const handleFreshData = (chordSheet: ChordSheet, fetchPath: string) => {
      // Update URL if needed using navigation utils (only if artist/title exist)
      if (chordSheet.artist && chordSheet.title) {
        navigationUtils.performUrlUpdate(
          { artist: chordSheet.artist, song: chordSheet.title },
          params,
          fetchPath,
          navigate,
          window.location.pathname
        );
      }
      
      dataHandlers.handleFreshData(chordSheet, setChordData);
    };

    const handleFetchError = (err: unknown, fetchPath: string, isReconstructed: boolean) => {
      console.error("Error fetching chord sheet:", err);

      const errorMessage = errorHandler.formatFetchError(err, fetchPath, isReconstructed);
      
      dataHandlers.handleErrorState(
        errorMessage,
        fetchPath,
        initialState,
        setChordData
      );
    };

    loadChordSheet();
  }, [
    originalPath,
    params,
    navigate, 
    loadingStrategy,
    urlStrategy,
    navigationUtils,
    dataHandlers,
    errorHandler
  ]);

  return chordData;
}
