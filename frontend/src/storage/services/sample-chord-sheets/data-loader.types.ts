/**
 * Types for sample chord sheet data loading
 */

import type { ChordSheet, SongMetadata } from '@chordium/types';

/**
 * Sample chord sheet with separate metadata and content
 */
export interface SampleChordSheetRecord {
  path: string;
  metadata: SongMetadata;
  content: ChordSheet;
  /** Full arrangement (with tabs), when the source has a distinct one. */
  fullContent?: ChordSheet;
}
