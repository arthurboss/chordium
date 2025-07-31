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
  savedChordSheets,
}: ChordSheetsInitParams): void {
  const { loadSamples } = sampleLoading;
  const { refreshMyChordSheets } = savedChordSheets;

  useEffect(() => {
    const initializeChordSheets = async () => {
      await loadSamples();
      await refreshMyChordSheets();
    };

    initializeChordSheets();
  }, [loadSamples, refreshMyChordSheets]);
}
