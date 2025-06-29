import { ChordSheetWithUIState } from '@/types/chordSheetWithUIState';
import { findLocalSong } from './local-chord-sheet-finder';
import { buildChordSheetData } from './chord-data-builder';
import { isMyChordSheetsRoute } from './route-context-detector';

/**
 * Strategy class for loading chord sheets with proper hierarchy:
 * 1. Local songs (My Chord Sheets context)
 * 2. Cache (handled elsewhere)
 * 3. Remote fetch (last resort)
 * 
 * Follows SRP: Single responsibility of loading strategy coordination
 */
export class ChordSheetLoadingStrategy {
  /**
   * Determines if we should attempt to load from local sources first
   * 
   * @param artist - Artist parameter from route
   * @param song - Song parameter from route
   * @returns boolean - True if should load local
   */
  shouldLoadLocal(artist?: string, song?: string): boolean {
    return isMyChordSheetsRoute() && Boolean(artist) && Boolean(song);
  }

  /**
   * Attempts to load chord sheet from local sources
   * 
   * @param artist - Artist parameter from route
   * @param song - Song parameter from route
   * @returns Promise<ChordSheetWithUIState | null> - Chord data or null if not found locally
   */
  async loadLocal(artist: string, song: string): Promise<ChordSheetWithUIState | null> {
    try {
      console.log('Loading from My Chord Sheets locally...');
      const localSong = await findLocalSong(artist, song);
      
      if (localSong) {
        console.log('Found song in local storage:', localSong.title);
        return buildChordSheetData(localSong);
      }
      
      return null;
    } catch (error) {
      console.error('Error loading local song:', error);
      return null;
    }
  }
}
