/**
 * Hook for managing saved chord sheets from IndexedDB
 * 
 * This hook provides access to the user's saved chord sheets from IndexedDB.
 * It includes both user-added chord sheets and sample chord sheets (in dev mode).
 * 
 * Returns StoredChordSheet[] which contains all needed info including path.
 */

import { useState, useEffect, useCallback } from "react";
import type { StoredChordSheet } from "../types/chord-sheet";
import { ChordSheetStore } from "../stores/chord-sheets/store";

/**
 * Hook for managing saved chord sheets from IndexedDB
 * @returns Object with chordSheets (StoredChordSheet[]) and refresh function
 */
export function useSavedChordSheets() {
  const [chordSheets, setChordSheets] = useState<StoredChordSheet[]>([]);

  const refresh = useCallback(async () => {
    try {
      // Get saved chord sheets from IndexedDB using the direct store
      const chordSheetStore = new ChordSheetStore();
      const storedChordSheets = await chordSheetStore.getAllSaved();
      
      // StoredChordSheet already has all the information we need, including path
      setChordSheets(storedChordSheets);
    } catch (error) {
      console.error('Failed to load saved chord sheets from IndexedDB:', error);
      setChordSheets([]);
    }
  }, []);

  useEffect(() => {
    // Load saved chord sheets on mount
    refresh();
  }, [refresh]);

  return { 
    chordSheets, // StoredChordSheet[] - contains all info including path
    refresh 
  };
}
