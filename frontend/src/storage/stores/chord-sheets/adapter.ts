/**
 * Adapter to make ChordSheetStore compatible with IChordSheetStorage interface
 * Following adapter pattern to bridge between interfaces
 */

import type { ChordSheet } from '@chordium/types';
import type { StoredChordSheet } from '../../types';
import type { IChordSheetStorage } from '../../services/sample-chord-sheets/types';
import { ChordSheetStore } from './store';

/**
 * Adapter that implements IChordSheetStorage using ChordSheetStore
 * Simplifies the interface for sample chord sheets service
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
   * Store a chord sheet with saved flag
   */
  async store(
    path: string,
    chordSheet: ChordSheet,
    saved: boolean
  ): Promise<void> {
    return this.chordSheetStore.store(chordSheet, saved, path);
  }
}

export const chordSheetStore = new ChordSheetStore();
export const chordSheetStorage = new ChordSheetStorageAdapter(chordSheetStore);
