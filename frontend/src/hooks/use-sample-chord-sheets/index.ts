import { useState, useEffect, useCallback } from "react";
import { Song } from "@/types/song";
import { ChordSheet } from "@/types/chordSheet";
import { chordSheetToSong } from "@/utils/chord-sheet-storage";
import { unifiedChordSheetCache } from "@/cache/implementations/unified-chord-sheet-cache";

/**
 * Load sample chord sheets and populate cache in development mode only
 * In production, this does nothing and returns immediately
 */
const loadSampleChordSheets = async (): Promise<void> => {
  // In production, do nothing
  if (!import.meta.env.DEV) {
    return;
  }

  // Check if My Chord Sheets is already populated
  const existingChordSheets = unifiedChordSheetCache.getAllSavedChordSheets();
  if (existingChordSheets.length > 0) {
    return;
  }

  try {
    // Dynamic imports only in development mode to prevent bundling in production
    const [wonderwallModule, hotelCaliforniaModule] = await Promise.all([
      import('./sample-chord-sheets/oasis-wonderwall.json'),
      import('./sample-chord-sheets/eagles-hotel_california.json')
    ]);

    const sampleChordSheets = [wonderwallModule.default, hotelCaliforniaModule.default] as ChordSheet[];

    // Add each sample chord sheet to My Chord Sheets cache
    sampleChordSheets.forEach((chordSheet) => {
      unifiedChordSheetCache.cacheChordSheet(chordSheet.artist, chordSheet.title, chordSheet);
      unifiedChordSheetCache.setSavedStatus(chordSheet.artist, chordSheet.title, true);
    });
  } catch (error) {
    console.warn('Failed to load sample chord sheets in development mode:', error);
  }
};

// Custom hook to initialize My Chord Sheets (includes sample chord sheets in dev mode)
export function useSampleChordSheets() {
  const [myChordSheets, setMyChordSheets] = useState<Song[]>([]);

  const refreshMyChordSheets = useCallback(() => {
    // Get My Chord Sheets from the cache (this includes both user-added and dev-mode sample chord sheets)  
    const chordSheets = unifiedChordSheetCache.getAllSavedChordSheets();
    const chordSheetsAsSongs = chordSheets.map(chordSheetToSong);
    
    setMyChordSheets(chordSheetsAsSongs);
  }, []);

  useEffect(() => {
    const initializeChordSheets = async () => {
      // Load sample chord sheets in dev mode only - this populates the cache directly
      await loadSampleChordSheets();
      
      // Load My Chord Sheets (now includes sample chord sheets in dev mode)
      refreshMyChordSheets();
    };
    initializeChordSheets();
  }, [refreshMyChordSheets]);

  return { myChordSheets, setMyChordSheets, refreshMyChordSheets };
}
