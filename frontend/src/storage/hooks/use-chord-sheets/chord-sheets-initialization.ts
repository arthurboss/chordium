import { useEffect, useRef } from "react";
import type { ChordSheetsInitializationParams } from "./chord-sheets-initialization.types";

/**
 * Initialize chord sheets data from storage or samples
 * 
 * Handles the initialization logic by orchestrating sample loading followed by
 * chord sheets refresh to ensure data is available for the application.
 * 
 * @param params - Initialization parameters containing loading and refresh functions
 * @returns void
 */
export function useChordSheetsInitialization({
  loadSamples,
  refreshMyChordSheets
}: ChordSheetsInitializationParams): void {
  
  // Store latest functions in refs to avoid dependency issues
  const loadSamplesRef = useRef(loadSamples);
  const refreshMyChordSheetsRef = useRef(refreshMyChordSheets);
  
  // Update refs when functions change
  loadSamplesRef.current = loadSamples;
  refreshMyChordSheetsRef.current = refreshMyChordSheets;
  
  useEffect(() => {
    const initializeChordSheets = async () => {
      // Sequential execution to avoid concurrent database connections
      await loadSamplesRef.current();
      await refreshMyChordSheetsRef.current();
    };

    initializeChordSheets();
  }, []); // Only run once on mount
}
