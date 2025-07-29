/**
 * Hook for managing My Chord Sheets using pure IndexedDB
 * 
 * This hook provides access to the user's saved chord sheets from IndexedDB.
 * It includes both user-added chord sheets and sample chord sheets (in dev mode).
 * 
 * Returns both ChordSheet[] and Song[] for different use cases.
 */

import { useState, useEffect, useCallback } from "react";
import { ChordSheet, Song } from "@chordium/types";
import { indexedDBStorage } from "@/storage/services/sample-songs";
import { chordSheetToSong } from "@/utils/chord-sheet-to-song";

/**
 * Hook for managing My Chord Sheets using pure IndexedDB
 * @returns Object with myChordSheets (ChordSheet[]), myChordSheetsAsSongs (Song[]), setter, and refresh function
 */
export function useMyChordSheetsIndexedDB() {
  const [myChordSheets, setMyChordSheets] = useState<ChordSheet[]>([]);
  const [myChordSheetsAsSongs, setMyChordSheetsAsSongs] = useState<Song[]>([]);

  const refreshMyChordSheets = useCallback(async () => {
    try {
      // Get My Chord Sheets from IndexedDB (includes both user-added and dev-mode sample chord sheets)  
      const storedChordSheets = await indexedDBStorage.getAllSaved();
      
      // Convert StoredChordSheet[] to ChordSheet[] by extracting just the chord sheet data
      const chordSheets: ChordSheet[] = storedChordSheets.map(stored => ({
        title: stored.title,
        artist: stored.artist,
        songChords: stored.songChords,
        songKey: stored.songKey,
        guitarTuning: stored.guitarTuning,
        guitarCapo: stored.guitarCapo
      }));
      
      // Also create Song[] version for UI components that need path navigation
      const songsForUI: Song[] = chordSheets.map(chordSheetToSong);
      
      setMyChordSheets(chordSheets);
      setMyChordSheetsAsSongs(songsForUI);
    } catch (error) {
      console.error('Failed to load My Chord Sheets from IndexedDB:', error);
      setMyChordSheets([]);
      setMyChordSheetsAsSongs([]);
    }
  }, []);

  useEffect(() => {
    // Load My Chord Sheets on mount
    refreshMyChordSheets();
  }, [refreshMyChordSheets]);

  return { 
    myChordSheets,           // ChordSheet[] - for components that work with full chord sheet data
    myChordSheetsAsSongs,    // Song[] - for UI components that need path navigation  
    setMyChordSheets, 
    refreshMyChordSheets 
  };
}
