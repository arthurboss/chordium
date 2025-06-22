import { ChordSheet } from '@/types/chordSheet';

/**
 * Extended ChordSheet interface with UI state for loading and error handling
 * Follows SRP: Single responsibility for UI state management
 */
export interface ChordSheetWithUIState extends ChordSheet {
  loading: boolean;
  error: string | null;
}

/**
 * Creates a default ChordSheet with UI state
 * @param loading - Loading state
 * @param error - Error message if any
 * @returns ChordSheetWithUIState with default values
 */
export function createDefaultChordSheetWithUIState(
  loading: boolean = false,
  error: string | null = null
): ChordSheetWithUIState {
  return {
    title: '',
    artist: 'Unknown Artist',
    songChords: '',
    songKey: '',
    guitarTuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    guitarCapo: 0,
    loading,
    error
  };
}

/**
 * Converts a ChordSheet to ChordSheetWithUIState
 * @param chordSheet - The ChordSheet to convert
 * @param loading - Loading state
 * @param error - Error message if any
 * @returns ChordSheetWithUIState
 */
export function toChordSheetWithUIState(
  chordSheet: ChordSheet,
  loading: boolean = false,
  error: string | null = null
): ChordSheetWithUIState {
  return {
    ...chordSheet,
    loading,
    error
  };
}
