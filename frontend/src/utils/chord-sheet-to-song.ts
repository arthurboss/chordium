/**
 * Utility to convert ChordSheet to Song for UI navigation purposes
 * Creates the path field needed for Song interface
 */

import { ChordSheet, Song } from "@chordium/types";

/**
 * Converts a ChordSheet to a Song for UI components that need path navigation
 * @param chordSheet - The chord sheet to convert
 * @returns Song object with path field for navigation
 */
export function chordSheetToSong(chordSheet: ChordSheet): Song {
  const path = `${chordSheet.artist.toLowerCase().replace(/\s+/g, '-')}/${chordSheet.title.toLowerCase().replace(/\s+/g, '-')}`;
  
  return {
    path,
    title: chordSheet.title,
    artist: chordSheet.artist
  };
}
