import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useChordSheetWithFallback } from "@/hooks/useChordSheetWithFallback";
import type { RouteParams } from "../../chord-viewer/chord-viewer.types";

// Utils
import { resolveChordSheetPath } from "../../chord-viewer/utils/path-resolver";
import { createChordSheetData } from "../../chord-viewer/utils/chord-sheet-data";
import { extractNavigationData } from "../../chord-viewer/utils/navigation-data";

/**
 * Custom hook for managing chord sheet data fetching and state
 * 
 * Handles path resolution, data fetching, and local state management
 * for the chord sheet page component.
 */
export const useChordSheetData = () => {
  const routeParams = useParams() as RouteParams;
  const location = useLocation();

  // Try to get the path from navigation state first (most accurate)
  // Fall back to URL parameters if navigation state is not available
  const navigationData = extractNavigationData(location.state);
  const path = navigationData?.path || resolveChordSheetPath(routeParams);

  // Fetch chord sheet data with API fallback
  const chordSheetResult = useChordSheetWithFallback(path);

  // Create complete chord sheet data object (only if metadata exists)
  const chordSheetData = chordSheetResult.metadata
    ? createChordSheetData(
        {
          title: chordSheetResult.metadata.title,
          artist: chordSheetResult.metadata.artist,
          songKey: chordSheetResult.metadata.songKey,
          guitarTuning: chordSheetResult.metadata.guitarTuning,
          guitarCapo: chordSheetResult.metadata.guitarCapo,
        },
        {
          songChords: chordSheetResult.content?.songChords || '',
        },
        path
      )
    : null;

  // Local state for saved status to update UI immediately after save
  const [isSaved, setIsSaved] = useState(
    chordSheetResult.metadata?.storage?.saved ?? false
  );

  // Keep isSaved in sync with chordSheetResult
  useEffect(() => {
    setIsSaved(chordSheetResult.metadata?.storage?.saved ?? false);
  }, [chordSheetResult.metadata?.storage?.saved]);

  // Auto-load from API if not found locally
  useEffect(() => {
    if (!chordSheetResult.chordSheet && !chordSheetResult.isFromAPI && !chordSheetResult.isLoading && path) {
      chordSheetResult.loadFromAPI();
    }
  }, [chordSheetResult, path]);

  return {
    path,
    routeParams,
    chordSheetResult,
    chordSheetData,
    isSaved,
    setIsSaved
  };
};
