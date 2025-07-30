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
      // Direct store access for better performance than abstract layer
      const chordSheetStore = new ChordSheetStore();
      const storedChordSheets = await chordSheetStore.getAllSaved();
      
      setChordSheets(storedChordSheets);
    } catch (error) {
      console.error('[useSavedChordSheets] Failed to load saved chord sheets from IndexedDB:', error);
      setChordSheets([]);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { chordSheets, refresh };
}
