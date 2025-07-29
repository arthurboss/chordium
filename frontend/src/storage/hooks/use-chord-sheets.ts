/**
 * Pure IndexedDB hook for managing chord sheets (both samples and user-saved)
 * 
 * This hook provides a single source of truth for all chord sheet management:
 * - Loads sample songs in development mode (into IndexedDB)
 * - Manages My Chord Sheets (from IndexedDB)
 * - NO localStorage dependencies - pure IndexedDB only
 */

import { useState, useEffect, useCallback } from "react";
import { Song } from "@/types/song";
import type { StoredChordSheet } from "@/storage/types";
import { SampleSongsService, indexedDBStorage } from "@/storage/services/sample-songs";
import { ChordSheetStore } from "@/storage/stores/chord-sheets/store";

/**
 * Convert StoredChordSheet to Song for UI compatibility
 */
function storedChordSheetToSong(storedChordSheet: StoredChordSheet): Song {
  return {
    artist: storedChordSheet.artist,
    title: storedChordSheet.title,
    path: `${storedChordSheet.artist.toLowerCase().replace(/\s+/g, '-')}/${storedChordSheet.title.toLowerCase().replace(/\s+/g, '-')}`,
    songKey: storedChordSheet.songKey,
    guitarTuning: storedChordSheet.guitarTuning,
    guitarCapo: storedChordSheet.guitarCapo
  };
}

/**
 * Pure IndexedDB hook for chord sheets management
 * Handles both sample loading and My Chord Sheets
 */
export function useChordSheets() {
  const [myChordSheets, setMyChordSheets] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const chordSheetStore = new ChordSheetStore();

  const loadMyChordSheets = useCallback(async () => {
    try {
      const savedChordSheets = await chordSheetStore.getAllSaved();
      const songsFromChordSheets = savedChordSheets.map(storedChordSheetToSong);
      setMyChordSheets(songsFromChordSheets);
    } catch (err) {
      console.error('Failed to load My Chord Sheets from IndexedDB:', err);
      setError(err as Error);
    }
  }, [chordSheetStore]);

  const refreshMyChordSheets = useCallback(async () => {
    await loadMyChordSheets();
  }, [loadMyChordSheets]);

  useEffect(() => {
    const initializeChordSheets = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load sample songs in development mode (stores them in IndexedDB)
        const sampleSongsService = new SampleSongsService(indexedDBStorage);
        await sampleSongsService.loadSampleSongs();

        // Load My Chord Sheets from IndexedDB (includes samples if they were loaded)
        await loadMyChordSheets();

      } catch (err) {
        console.error('Failed to initialize chord sheets:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChordSheets();
  }, [loadMyChordSheets]);

  return { 
    myChordSheets, 
    setMyChordSheets, 
    refreshMyChordSheets,
    isLoading,
    error
  };
}
