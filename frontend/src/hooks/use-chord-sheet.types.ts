/**
 * Type definitions for chord sheet hook
 */

import type { ChordSheet } from "@chordium/types";

/**
 * Result interface for chord sheet hook
 * 
 * Provides chord sheet data with saved state and loading information
 */
export interface UseChordSheetResult {
  /** The loaded chord sheet data, null if not found */
  chordSheet: ChordSheet | null;
  /** Whether the chord sheet is saved by the user */
  isSaved: boolean;
  /** Loading state during fetch operations */
  isLoading: boolean;
  /** Error message if loading fails */
  error: string | null;
}

/**
 * Parameters for chord sheet hook
 */
export interface UseChordSheetParams {
  /** Path identifier for the chord sheet */
  path: string;
}
