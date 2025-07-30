/**
 * Orchestrated chord sheets hook
 * 
 * Composes the modular hooks (sample loading, saved sheets, initialization)
 * to provide the complete chord sheets functionality. Maintains the same
 * public API while using the new modular architecture.
 */

import { useMemo } from "react";
import type { UseChordSheetsResult } from "./use-chord-sheets.types";
import { 
  useSavedChordSheets, 
  useSampleLoading, 
  useChordSheetsInitialization 
} from "./chord-sheets";

/**
 * Composed hook for complete chord sheets management
 * 
 * Orchestrates sample loading and saved chord sheets management.
 * Maintains the original API while using focused modular components.
 */
export function useChordSheets(): UseChordSheetsResult {
  // Use focused hooks for specific concerns
  const savedChordSheets = useSavedChordSheets();
  const sampleLoading = useSampleLoading();
  
  // Coordinate sample loading and saved chord sheets management
  useChordSheetsInitialization({ sampleLoading, savedChordSheets });
  
  // Combine loading states for unified experience
  const isLoading = useMemo(() => 
    savedChordSheets.isLoading || sampleLoading.isLoadingSamples,
    [savedChordSheets.isLoading, sampleLoading.isLoadingSamples]
  );
  
  // Combine errors with priority (saved sheets errors take precedence)
  const error = useMemo(() => 
    savedChordSheets.error || sampleLoading.sampleError,
    [savedChordSheets.error, sampleLoading.sampleError]
  );

  return {
    myChordSheets: savedChordSheets.myChordSheets,
    setMyChordSheets: savedChordSheets.setMyChordSheets,
    refreshMyChordSheets: savedChordSheets.refreshMyChordSheets,
    isLoading,
    error
  };
}
