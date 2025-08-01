import type { ChordSheet } from '@/types/chordSheet';

/**
 * Complete chord sheet data container for ChordViewer component
 * Simplified: we just need the chord sheet content since path info comes from URL params
 */
export interface ChordSheetData {
  /** The chord sheet content */
  chordSheet: ChordSheet;
  /** The path (artist/song) for this chord sheet */
  path: string;
}

/**
 * Path information extracted from URL parameters
 * Based on current routing: /:artist/:song
 */
export interface ChordSheetParams {
  artist?: string;
  song?: string;
}
