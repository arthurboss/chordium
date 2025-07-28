/**
 * Types for sample songs service
 */

import type { ChordSheet } from '@chordium/types';

/**
 * Interface for chord sheet storage service
 * This will be implemented by the actual IndexedDB chord sheet service
 */
export interface IChordSheetStorageService {
  /** Get all saved chord sheets */
  getAllSaved(): Promise<ChordSheet[]>;
  
  /** Store a chord sheet with metadata */
  store(
    artist: string, 
    title: string, 
    chordSheet: ChordSheet, 
    metadata: { saved: boolean; source?: string }
  ): Promise<void>;
}
