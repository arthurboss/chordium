import { useEffect } from "react";
import type { UseChordSheetsResult } from "./types";
import { CHORD_SHEETS_CHANGED_EVENT } from "../../events";
import { useChordSheetsState } from "./state";
import { useChordSheetsOperations } from "./operations";
import { useSampleLoading } from "./sample";
import { useChordSheetsInit } from "./init";

export function useChordSheets(): UseChordSheetsResult {
  // Modular state management
  const state = useChordSheetsState();
  // Modular operations
  const { refreshMyChordSheets } = useChordSheetsOperations(state);
  // Modular sample loading
  const { loadSamples, isSampleLoading, sampleError } = useSampleLoading();
  // Modular initialization
  useChordSheetsInit(async () => {
    await loadSamples();
    await refreshMyChordSheets();
  });

  useEffect(() => {
    const handleChange = () => {
      void refreshMyChordSheets();
    };
    window.addEventListener(CHORD_SHEETS_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(CHORD_SHEETS_CHANGED_EVENT, handleChange);
  }, [refreshMyChordSheets]);

  // Combine loading states and errors
  const isLoading = state.isLoading || isSampleLoading;
  const error = state.error || sampleError;

  return {
    myChordSheets: state.optimisticChordSheets,
    setMyChordSheets: state.setChordSheets,
    refreshMyChordSheets,
    isLoading,
    error,
  };
}
