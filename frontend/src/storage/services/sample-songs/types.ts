/**
 * Types for sample songs service
 */

import type { ChordSheet } from '@chordium/types';
import type { StoredChordSheet } from '../../types';

/**
 * Interface for chord sheet storage operations
 * Following SRP - only methods needed for sample songs
 */
export interface IChordSheetStorage {
  getAllSaved(): Promise<StoredChordSheet[]>;
  store(path: string, chordSheet: ChordSheet, metadata: { saved: boolean; source?: string }): Promise<void>;
}
