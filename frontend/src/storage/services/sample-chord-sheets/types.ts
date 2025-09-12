/**
 * Types for sample chord sheets service
 */

import type { ChordSheet, Song, SongMetadata } from '@chordium/types';
import type { ChordSheetListItem } from '../../stores/chord-sheets/operations/get-all-saved';

/**
 * Interface for chord sheet storage operations
 */
export interface IChordSheetStorage {
  getAllSaved(): Promise<ChordSheetListItem[]>;
  store(metadata: SongMetadata, content: ChordSheet, saved: boolean, path: Song["path"]): Promise<void>;
}
