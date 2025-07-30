/**
 * Types for sample chord sheets service
 */

import type { ChordSheet } from '@chordium/types';
import type { StoredChordSheet } from '../../types/chord-sheet';

/**
 * Interface for chord sheet storage operations
 * 
 * Following SRP - only methods needed for sample chord sheets
 */
export interface IChordSheetStorage {
  getAllSaved(): Promise<StoredChordSheet[]>;
  store(path: string, chordSheet: ChordSheet, saved: boolean): Promise<void>;
}
