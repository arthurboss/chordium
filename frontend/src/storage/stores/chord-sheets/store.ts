/**
 * Chord sheet storage interface for user's local data
 */

import type { ChordSheet, Song } from '@chordium/types';
import type { StoredChordSheet } from '../../types';
import {
  getChordSheet,
  getAllSavedChordSheets,
  storeChordSheet,
  deleteChordSheet,
  deleteAllChordSheets
} from './operations';

/**
 * Manages chord sheet storage operations
 */
export class ChordSheetStore {
  /**
   * Get all saved chord sheets
   */
  async getAllSaved(): Promise<StoredChordSheet[]> {
    return getAllSavedChordSheets();
  }

  /**
   * Store a chord sheet with metadata
   */
  async store(
    chordSheet: ChordSheet,
    metadata: { saved: boolean; source?: string },
    path: Song["path"]
  ): Promise<void> {
    return storeChordSheet(chordSheet, metadata, path);
  }

  /**
   * Get a specific chord sheet
   */
  async get(path: Song["path"]): Promise<StoredChordSheet | null> {
    return getChordSheet(path);
  }

  /**
   * Delete a chord sheet
   */
  async delete(path: Song["path"]): Promise<void> {
    return deleteChordSheet(path);
  }

  /**
   * Delete all chord sheets
   */
  async deleteAll(): Promise<void> {
    return deleteAllChordSheets();
  }
}
