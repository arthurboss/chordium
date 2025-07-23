import { unifiedChordSheetCache } from '@/cache/implementations/unified-chord-sheet-cache';
import { ChordSheet, Song } from '@chordium/types';
import { isAccentInsensitiveMatch } from '@/search/utils';

/**
 * Converts a ChordSheet to a Song object for search results
 * @param chordSheet - The ChordSheet to convert
 * @returns Song object suitable for search results display
 */
export function convertChordSheetToSong(chordSheet: ChordSheet): Song {
  return {
    title: chordSheet.title,
    artist: chordSheet.artist,
    path: `/my-chord-sheets/${encodeURIComponent(chordSheet.artist)}/${encodeURIComponent(chordSheet.title)}`
  };
}

/**
 * Search My Chord Sheets for matches using accent-insensitive search
 * @param artistQuery - Artist search term (optional)
 * @param songQuery - Song/title search term (optional)
 * @returns Array of Song objects from My Chord Sheets that match the search
 */
export function searchMyChordSheets(artistQuery?: string, songQuery?: string): Song[] {
  // Get all chord sheets from My Chord Sheets
  const allMyChordSheets = unifiedChordSheetCache.getAllSavedChordSheets();
  
  // If no search terms, return empty array (don't return all songs)
  if (!artistQuery?.trim() && !songQuery?.trim()) {
    return [];
  }
  
  // Filter songs based on search criteria
  const matchingSongs = allMyChordSheets.filter(chordSheet => {
    let artistMatch = true;
    let songMatch = true;
    
    // Check artist match if artist query provided
    if (artistQuery?.trim()) {
      artistMatch = isAccentInsensitiveMatch(artistQuery.trim(), chordSheet.artist);
    }
    
    // Check song/title match if song query provided  
    if (songQuery?.trim()) {
      songMatch = isAccentInsensitiveMatch(songQuery.trim(), chordSheet.title);
    }
    
    // Both conditions must be true (if provided)
    return artistMatch && songMatch;
  });
  
  // Convert ChordSheets to Songs for consistency with search results
  return matchingSongs.map(convertChordSheetToSong);
}

/**
 * Check if there are any local songs that match the search criteria
 * @param artistQuery - Artist search term (optional)
 * @param songQuery - Song/title search term (optional)
 * @returns True if any local songs match the search
 */
export function hasLocalMatches(artistQuery?: string, songQuery?: string): boolean {
  const matches = searchMyChordSheets(artistQuery, songQuery);
  return matches.length > 0;
}
