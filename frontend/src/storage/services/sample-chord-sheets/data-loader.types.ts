/**
 * Types for sample chord sheet data loading
 */

import type { ChordSheet, SongMetadata } from '@chordium/types';
import type { LyricsTranslations } from '@/storage/services/lyrics-storage';

/**
 * Sample chord sheet with separate metadata and content
 */
export interface SampleChordSheetRecord {
  path: string;
  metadata: SongMetadata;
  content: ChordSheet;
  /** Full arrangement (with tabs), when the source has a distinct one. */
  fullContent?: ChordSheet;
  /** Lyric translations shipped with the sample, so it needs no translating. */
  translations?: LyricsTranslations;
}
