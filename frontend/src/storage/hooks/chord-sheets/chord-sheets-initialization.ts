/**
 * Chord sheets initialization orchestration
 * 
 * Handles the complex initialization logic that coordinates sample loading
 * and saved chord sheets loading. Extracted from hook for reusability.
 */

import { useEffect } from "react";
import type { ChordSheetsInitParams } from "./chord-sheets-initialization.types";

/**
 * Initialization effect for chord sheets
 * 
 * Orchestrates the loading of samples followed by refreshing saved sheets.
 * Extracted as utility to separate initialization logic from hook state.
 */
export function useChordSheetsInitialization({
  sampleLoading,
  savedChordSheets
}: ChordSheetsInitParams): void {
  const { loadSamples } = sampleLoading;
  const { refreshMyChordSheets } = savedChordSheets;

  useEffect(() => {
    const initializeChordSheets = async () => {
      // Load sample songs first (in development mode)
      await loadSamples();
      
      // Then load/refresh saved chord sheets (includes samples if loaded)
      await refreshMyChordSheets();
    };

    initializeChordSheets();
  }, [loadSamples, refreshMyChordSheets]);
}
