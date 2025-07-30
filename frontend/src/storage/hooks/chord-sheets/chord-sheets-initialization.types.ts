/**
 * Type definitions for chord sheets initialization
 * 
 * Defines interfaces and types used by the chord sheets
 * initialization orchestration logic.
 */

import type { UseSampleLoadingResult } from "./use-sample-loading.types";
import type { UseSavedChordSheetsResult } from "./use-saved-chord-sheets.types";

/**
 * Parameters for initialization effect
 */
export interface ChordSheetsInitParams {
  /** Sample loading hook results */
  sampleLoading: UseSampleLoadingResult;
  /** Saved chord sheets hook results */
  savedChordSheets: UseSavedChordSheetsResult;
}
