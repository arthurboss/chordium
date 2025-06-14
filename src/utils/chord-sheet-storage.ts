import { ChordSheet } from '@/types/chordSheet';
import { generateChordSheetId } from './chord-sheet-id-generator';

const CHORD_SHEETS_STORAGE_KEY = 'chord-sheets';

/**
 * Retrieves a chord sheet from localStorage by ID
 * @param id - Chord sheet ID (e.g., "leonardo_goncalves-getsemani")
 * @returns ChordSheet object or null if not found
 */
export function getChordSheet(id: string): ChordSheet | null {
  try {
    const stored = localStorage.getItem(CHORD_SHEETS_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const chordSheets = JSON.parse(stored);
    const chordSheet = chordSheets[id];

    if (!chordSheet) {
      return null;
    }

    // Validate that the stored object matches our ChordSheet interface
    if (
      typeof chordSheet.title === 'string' &&
      typeof chordSheet.artist === 'string' &&
      typeof chordSheet.chords === 'string' &&
      typeof chordSheet.key === 'string' &&
      typeof chordSheet.tuning === 'string' &&
      typeof chordSheet.capo === 'string'
    ) {
      return chordSheet as ChordSheet;
    }

    console.warn(`Invalid chord sheet data found for ID: ${id}`);
    return null;
  } catch (error) {
    console.error('Error retrieving chord sheet:', error);
    return null;
  }
}

/**
 * Saves a chord sheet to localStorage
 * @param id - Chord sheet ID
 * @param chordSheet - ChordSheet object to save
 */
export function saveChordSheet(id: string, chordSheet: ChordSheet): void {
  try {
    const stored = localStorage.getItem(CHORD_SHEETS_STORAGE_KEY);
    const chordSheets = stored ? JSON.parse(stored) : {};

    // Ensure all required fields have string values
    const normalizedChordSheet: ChordSheet = {
      title: chordSheet.title || '',
      artist: chordSheet.artist || 'Unknown Artist',
      chords: chordSheet.chords || '',
      key: chordSheet.key || '',
      tuning: chordSheet.tuning || '',
      capo: chordSheet.capo || ''
    };

    chordSheets[id] = normalizedChordSheet;
    localStorage.setItem(CHORD_SHEETS_STORAGE_KEY, JSON.stringify(chordSheets));
  } catch (error) {
    console.error('Error saving chord sheet:', error);
    throw new Error('Failed to save chord sheet to localStorage');
  }
}

/**
 * Convenience function to save a chord sheet using artist and title to generate ID
 * @param artist - Artist name
 * @param title - Song title  
 * @param chordSheet - ChordSheet object to save
 * @returns The generated ID
 */
export function saveChordSheetByArtistTitle(
  artist: string, 
  title: string, 
  chordSheet: ChordSheet
): string {
  const id = generateChordSheetId(artist, title);
  saveChordSheet(id, chordSheet);
  return id;
}

/**
 * Deletes a chord sheet from localStorage
 * @param id - Chord sheet ID to delete
 * @returns true if deleted, false if not found
 */
export function deleteChordSheet(id: string): boolean {
  try {
    const stored = localStorage.getItem(CHORD_SHEETS_STORAGE_KEY);
    if (!stored) {
      return false;
    }

    const chordSheets = JSON.parse(stored);
    
    if (!(id in chordSheets)) {
      return false;
    }

    delete chordSheets[id];
    localStorage.setItem(CHORD_SHEETS_STORAGE_KEY, JSON.stringify(chordSheets));
    return true;
  } catch (error) {
    console.error('Error deleting chord sheet:', error);
    return false;
  }
}

/**
 * Gets all chord sheet IDs from localStorage
 * @returns Array of chord sheet IDs
 */
export function getAllChordSheetIds(): string[] {
  try {
    const stored = localStorage.getItem(CHORD_SHEETS_STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const chordSheets = JSON.parse(stored);
    return Object.keys(chordSheets);
  } catch (error) {
    console.error('Error getting chord sheet IDs:', error);
    return [];
  }
}

/**
 * Gets all chord sheets from localStorage
 * @returns Record of ID -> ChordSheet
 */
export function getAllChordSheets(): Record<string, ChordSheet> {
  try {
    const stored = localStorage.getItem(CHORD_SHEETS_STORAGE_KEY);
    if (!stored) {
      return {};
    }

    return JSON.parse(stored);
  } catch (error) {
    console.error('Error getting all chord sheets:', error);
    return {};
  }
}

/**
 * Clears all chord sheets from localStorage
 */
export function clearAllChordSheets(): void {
  try {
    localStorage.removeItem(CHORD_SHEETS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing chord sheets:', error);
    throw new Error('Failed to clear chord sheets from localStorage');
  }
}
