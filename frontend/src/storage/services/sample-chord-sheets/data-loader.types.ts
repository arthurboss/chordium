/**
 * Types for sample chord sheet data loading
 */

import type { ChordSheet } from '@chordium/types';

/**
 * Sample chord sheet with associated path for storage
 */
export interface SampleChordSheetRecord {
  path: string;
  chordSheet: ChordSheet;
}
