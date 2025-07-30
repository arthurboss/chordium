/**
 * Orchestrated chord sheets hook
 * 
 * Composes the modular hooks (sample loading, saved sheets, initialization)
 * to provide the complete chord sheets functionality. Maintains the same
 * public API while using the new modular architecture.
 */

import { useMemo } from "react";
import type { StoredChordSheet } from "@/storage/types";
import { 
  useSavedChordSheets, 
  useSampleLoading, 
  useChordSheetsInitialization 
} from "./chord-sheets";

/**
 * Return type for the composed chord sheets hook
 */
export interface UseChordSheetsResult {
  /** Current saved chord sheets */
  myChordSheets: StoredChordSheet[];
  /** Function to update chord sheets state */
  setMyChordSheets: React.Dispatch<React.SetStateAction<StoredChordSheet[]>>;
  /** Function to refresh chord sheets from storage */
  refreshMyChordSheets: () => Promise<void>;
  /** Overall loading state (combines sample loading and chord sheets loading) */
  isLoading: boolean;
  /** Any error from operations */
  error: Error | null;
}

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
  
  // Orchestrate initialization
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
