/**
 * IndexedDB storage implementation for sample chord sheets service
 * 
 * Provides a clean interface for the sample chord sheets service to work with IndexedDB
 * storage. Implements the IChordSheetStorage interface using the chord sheets
 * store. This is the pure IndexedDB implementation without any localStorage
 * dependencies.
 */

import type { ChordSheet } from '@chordium/types';
import type { StoredChordSheet } from '../../types';
import type { IChordSheetStorage } from './types';
import { ChordSheetStore } from '../../stores/chord-sheets/store';

/**
 * IndexedDB implementation of chord sheet storage
 * 
 * Wraps the ChordSheetStore to provide the interface expected by the sample
 * chord sheets service. Handles the parameter ordering and provides a clean API
 * for the sample chord sheets loading logic.
 */
export class IndexedDBStorage implements IChordSheetStorage {
  private readonly chordSheetStore: ChordSheetStore;

  constructor() {
    this.chordSheetStore = new ChordSheetStore();
  }

  /**
   * Get all saved chord sheets
   * 
   * @returns Promise resolving to array of saved chord sheets
   */
  async getAllSaved(): Promise<StoredChordSheet[]> {
    return this.chordSheetStore.getAllSaved();
  }

  /**
   * Store a chord sheet in IndexedDB
   * 
   * @param path - The storage path (Song.path format)
   * @param chordSheet - The chord sheet data to store
   * @param saved - Whether this is a user-saved chord sheet
   * @returns Promise that resolves when storage is complete
   */
  async store(
    path: string,
    chordSheet: ChordSheet,
    saved: boolean
  ): Promise<void> {
    // Delegate to the chord sheet store with correct parameter ordering
    return this.chordSheetStore.store(chordSheet, saved, path);
  }
}

// Export singleton instance for easy use
export const indexedDBStorage = new IndexedDBStorage();
