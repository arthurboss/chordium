/**
 * Types for React 19 optimized storage hooks
 */

import type { StoredChordSheet } from "../types";

/**
 * Result from optimized database ready hook
 */
export interface UseDatabaseReadyOptimizedResult {
  database: unknown; // Database instance from connection
  isReady: true; // Always true when promise resolves
}

/**
 * Actions for optimistic chord sheet operations
 */
export interface OptimisticChordSheetActions {
  addOptimistic: (chordSheet: StoredChordSheet) => void;
  removeOptimistic: (path: string) => void;
}

/**
 * Result from optimized sample loading with action state
 */
export interface UseSampleLoadingOptimizedResult {
  isLoading: boolean;
  error: string | null;
  formAction: (formData: FormData) => void;
}
