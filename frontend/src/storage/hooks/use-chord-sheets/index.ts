import type { UseChordSheetsResult } from "./types";
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
