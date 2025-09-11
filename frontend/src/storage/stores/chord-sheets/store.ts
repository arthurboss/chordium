/**
 * Chord sheet storage interface for user's local data
 */

import type { ChordSheet, Song, SongMetadata } from "@chordium/types";
import type { StoredSongMetadata } from "../../types/stored-song-metadata";
import type { StoredChordSheet } from "../../types/stored-chord-sheet";
import {
  getChordSheetMetadata,
  getChordSheetContent,
  getChordSheetSplit,
  getAllSavedChordSheets,
  storeChordSheet,
  deleteChordSheet,
  deleteAllChordSheets,
} from "./operations";
import type { ChordSheetListItem } from "./operations/get-all-saved";

/**
 * Manages chord sheet storage operations
 */
export class ChordSheetStore {
  /**
   * Get all saved chord sheets (minimal data for list view)
   */
  async getAllSaved(): Promise<ChordSheetListItem[]> {
    return getAllSavedChordSheets();
  }

  /**
   * Store a chord sheet with metadata
   */
  async store(
    metadata: SongMetadata,
    content: ChordSheet,
    saved: boolean,
    path: Song["path"]
  ): Promise<void> {
    return storeChordSheet(metadata, content, saved, path);
  }

  /**
   * Get chord sheet metadata only
   */
  async getMetadata(path: Song["path"]): Promise<StoredSongMetadata | null> {
    return getChordSheetMetadata(path);
  }

  /**
   * Get chord sheet content only
   */
  async getContent(path: Song["path"]): Promise<StoredChordSheet | null> {
    return getChordSheetContent(path);
  }

  /**
   * Get both metadata and content for a chord sheet
   */
  async getSplit(path: Song["path"]): Promise<{ metadata: StoredSongMetadata; content: StoredChordSheet } | null> {
    return getChordSheetSplit(path);
  }

  /**
   * Delete a chord sheet
   */
  async delete(path: string): Promise<void> {
    return deleteChordSheet(path);
  }

  /**
   * Delete all chord sheets
   */
  async deleteAll(): Promise<void> {
    return deleteAllChordSheets();
  }
}
