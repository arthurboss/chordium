/**
 * Types for sample chord sheets service
 */

import type { ChordSheet } from '@chordium/types';
import type { ChordSheetListItem } from '../../stores/chord-sheets/operations/get-all-saved';

/**
 * Interface for chord sheet storage operations
 */
export interface IChordSheetStorage {
  getAllSaved(): Promise<ChordSheetListItem[]>;
  store(path: string, chordSheet: ChordSheet, saved: boolean): Promise<void>;
}
