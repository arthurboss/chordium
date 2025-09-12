/**
 * IndexedDB storage implementation for sample chord sheets service
 * 
 * Provides a clean interface for the sample chord sheets service to work with IndexedDB
 * storage. Implements the IChordSheetStorage interface using the chord sheets
 * store. This is the pure IndexedDB implementation without any localStorage
 * dependencies.
 */

import type { ChordSheet, Song, SongMetadata } from '@chordium/types';
import type { ChordSheetListItem } from '../../stores/chord-sheets/operations/get-all-saved';
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
   * @returns Promise resolving to array of saved chord sheet list items
   */
  async getAllSaved(): Promise<ChordSheetListItem[]> {
    return this.chordSheetStore.getAllSaved();
  }

  /**
   * Store a chord sheet in IndexedDB
   * 
   * @param metadata - Song metadata to store
   * @param content - Chord sheet content to store
   * @param saved - Whether this is a user-saved chord sheet
   * @param path - The storage path (Song.path format)
   * @returns Promise that resolves when storage is complete
   */
  async store(
    metadata: SongMetadata,
    content: ChordSheet,
    saved: boolean,
    path: Song["path"]
  ): Promise<void> {
    return this.chordSheetStore.store(metadata, content, saved, path);
  }
}

export const indexedDBStorage = new IndexedDBStorage();
