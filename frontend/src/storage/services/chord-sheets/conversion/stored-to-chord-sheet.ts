/**
 * Data conversion utilities for chord sheet storage
 * 
 * Handles conversion between storage and domain types, ensuring clean
 * separation between storage implementation and domain logic.
 */

import type { ChordSheet } from "@chordium/types";
import type { StoredChordSheet } from "../../../types/chord-sheet";

/**
 * Converts StoredChordSheet to domain ChordSheet
 * 
 * Extracts the domain-specific chord sheet data from the storage
 * wrapper, removing storage metadata for clean domain usage.
 */
export function storedToChordSheet(storedChordSheet: StoredChordSheet): ChordSheet {
  return {
    title: storedChordSheet.title,
    artist: storedChordSheet.artist,
    songChords: storedChordSheet.songChords,
    songKey: storedChordSheet.songKey,
    guitarTuning: storedChordSheet.guitarTuning,
    guitarCapo: storedChordSheet.guitarCapo
  };
}
