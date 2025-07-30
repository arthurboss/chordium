import { ChordSheet } from '@/types/chordSheet';
import type { Song } from '@chordium/types';
import { ChordSheetStore } from '@/storage/stores/chord-sheets/store';
import { getChordSheet } from "@/storage/stores/chord-sheets/operations";
import { storedToChordSheet } from "@/storage/services/chord-sheets/conversion";
import { fetchChordSheetFromBackend } from './fetch-chord-sheet-from-backend';

/**
 * Gets chord sheet data, checking IndexedDB first, then fetching if needed
 * 
 * @param path - Song path used as IndexedDB key (e.g., "eagles/hotel-california")
 * @param fetchUrl - URL to fetch from if not cached
 * @returns Promise with chord sheet data or null if failed
 */
export async function getChordSheetData(
  path: Song['path'],
  fetchUrl: string
): Promise<ChordSheet | null> {
  // Step 1: Check IndexedDB for any chord sheets first (cache or saved)
  const storedChordSheet = await getChordSheet(path);
  if (storedChordSheet) {
    // Convert to domain format and return
    return storedToChordSheet(storedChordSheet);
  }
  
  // Step 2: Not in IndexedDB, fetch from backend
  // Extract artist and title from songPath for backend call
  const pathParts = path.split('/');
  const artist = pathParts[0]?.replace(/-/g, ' ') || '';
  const title = pathParts[1]?.replace(/-/g, ' ') || '';
  
  const fetchedChordSheet = await fetchChordSheetFromBackend(fetchUrl, artist, title);
  
  if (fetchedChordSheet) {
    // Store the fetched chord sheet in IndexedDB for future use
    try {
      const chordSheetStore = new ChordSheetStore();
      await chordSheetStore.store(fetchedChordSheet, { saved: false }, path);
    } catch (error) {
      console.error('Error storing chord sheet in IndexedDB:', error);
      // Continue anyway - we have the chord sheet data
    }
  }
  
  return fetchedChordSheet;
}
