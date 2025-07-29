/**
 * IndexedDB storage implementation for sample songs service
 * 
 * Provides a clean interface for the sample songs service to work with IndexedDB
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
 * songs service. Handles the parameter ordering and provides a clean API
 * for the sample songs loading logic.
 */
export class IndexedDBStorage implements IChordSheetStorage {
  private readonly chordSheetStore: ChordSheetStore;

  constructor() {
    this.chordSheetStore = new ChordSheetStore();
  }

  /**
   * Get all saved chord sheets from IndexedDB
   * 
   * @returns Promise resolving to array of saved StoredChordSheet objects
   */
  async getAllSaved(): Promise<StoredChordSheet[]> {
    return this.chordSheetStore.getAllSaved();
  }

  /**
   * Store a chord sheet in IndexedDB
   * 
   * @param path - The storage path (Song.path format)
   * @param chordSheet - The chord sheet data to store
   * @param metadata - Storage metadata including saved status
   * @returns Promise that resolves when storage is complete
   */
  async store(
    path: string,
    chordSheet: ChordSheet,
    metadata: { saved: boolean; source?: string }
  ): Promise<void> {
    // Delegate to the chord sheet store with correct parameter ordering
    return this.chordSheetStore.store(chordSheet, metadata, path);
  }
}

// Export singleton for use in sample songs service
export const indexedDBStorage = new IndexedDBStorage();
