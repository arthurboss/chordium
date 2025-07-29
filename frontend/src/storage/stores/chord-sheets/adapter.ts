/**
 * Adapter to make ChordSheetStore compatible with IChordSheetStorage interface
 * Following adapter pattern to bridge between interfaces
 */

import type { ChordSheet } from '@chordium/types';
import type { StoredChordSheet } from '../../types';
import type { IChordSheetStorage } from '../../services/sample-songs/types';
import { ChordSheetStore } from './store';

/**
 * Adapter that implements IChordSheetStorage using ChordSheetStore
 * Simplifies the interface for sample songs service
 */
export class ChordSheetStorageAdapter implements IChordSheetStorage {
  constructor(private readonly chordSheetStore: ChordSheetStore) {}

  /**
   * Get all saved chord sheets
   */
  async getAllSaved(): Promise<StoredChordSheet[]> {
    return this.chordSheetStore.getAllSaved();
  }

  /**
   * Store a chord sheet with metadata
   */
  async store(
    path: string,
    chordSheet: ChordSheet,
    metadata: { saved: boolean; source?: string }
  ): Promise<void> {
    // Pass the path to the store method as required by the signature
    return this.chordSheetStore.store(chordSheet, metadata, path);
  }
}

// Export singleton instances for easy use
export const chordSheetStore = new ChordSheetStore();
export const chordSheetStorage = new ChordSheetStorageAdapter(chordSheetStore);
